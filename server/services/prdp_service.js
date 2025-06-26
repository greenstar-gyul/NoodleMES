// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../utils/converts.js');

// 실제 제공할 서비스 등록 영역

// 조건 없이 전체조회
const findAll = async () => {
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("selectPrdpList")
                          .catch(err => console.log(err));
  return list;
};

// 오늘기준 해당하는달에 대한 조회
const selectMonth = async () => {
  let list = await mariadb.query("selectMonthPlans")
                          .catch(err => {
                            console.error('❌ 쿼리 실패:', err);
                            return []; // ✅ 빈 배열 반환
                          });
  return list;
};

// ✅ 서비스 함수
const findOrder = async () => {
  const list = await mariadb.query("selectOrdList") // ← 이 이름 정확히 확인!
    .catch(err => console.log(err));
  return list;
};

// 생산라인 목록 조회 by 제품유형 + 제품전용 라인
const findLineByType = async (lineType, prodCode) => {
  console.log("🔍 전달된 lineType:", lineType);
  console.log("🔍 전달된 prodCode:", prodCode);

  const values = [lineType, prodCode];

  return await mariadb.query("selectLineType", values)
    .catch((err) => {
      console.error("🔴 라인 조회 실패:", err);
      throw err;
    });
};

// 제품 조회
const findProd = async (ordCode) => {
  try {
    let list;
    if (ordCode) {
      list = await mariadb.query("selectProdOne", [ordCode]);
    } else {
      list = await mariadb.query("selectProdList");
    }
    return list;
  } catch (err) {
    console.log('🔴 제품 조회 중 오류:', err);
    return [];
  }
};

// 상세정보 전체조회
const findDetail = async (prdpCode) => {
  try {
    const result = await mariadb.query("selectPrdpDOne", [prdpCode]);
    return result; 
  } catch (err) {
    console.error('findDetail 오류:', err);
    throw err;
  }
};

// 검색 조건 
const searchPrdp = async (params) => {
  // null이나 undefined도 체크해서 null로 맞춰주기
  const bindParams = [
    params.prdp_code ?? null, params.prdp_code ?? null,
    params.prdp_name ?? null, params.prdp_name ?? null,
    params.prdp_date_from ?? null, params.prdp_date_from ?? null,
    params.prdp_date_to ?? null, params.prdp_date_to ?? null,
    params.due_date_from ?? null, params.due_date_from ?? null,
    params.due_date_to ?? null, params.due_date_to ?? null
  ];

  const list = await mariadb.query("searchPrdp", bindParams)
                            .catch(err => console.log(err));
  return list;
};

// 등록시 동작 트랜잭션
const insertProductionTx = async (data) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction(); // 트랜잭션 시작

    // ✅ 생산계획 코드 생성 (예: PRDP-2025-0001)
    const prdpCodeRes = await mariadb.queryConn(conn, "selectPrdpCodeForUpdate");
    const prdpCode = prdpCodeRes[0]?.new_code; // ❗ 'new_code'로 받아오기
    data.prdpData.prdp_code = prdpCode;

    // ✅ reg 기본값 설정
    data.prdpData.reg = data.prdpData.reg || 'EMP-10001';

    // ✅ 생산계획 메인 파라미터 구성
    const prdpParams = convertObjToAry(data.prdpData, [
      'prdp_code',
      'prdp_name',
      'prdp_date',
      'due_date',
      'reg',
      'note',
      'start_date',
      'end_date',
      'ord_code'
    ]);

    // ✅ 메인 테이블 INSERT
    const result = await mariadb.queryConn(conn, "insertPrdp", prdpParams);

    // ✅ 상세 항목 처리
    for (const detail of data.detailData) {
      detail.prdp_code = prdpCode;

      // ✅ 상세 코드 생성 (예: PRDP-D-0001)
      const prdpDCodeRes = await mariadb.queryConn(conn, "selectPrdpDCodeForUpdate");
      const prdp_d_code = prdpDCodeRes[0]?.new_d_code;
      detail.prdp_d_code = prdp_d_code;

      // ✅ 상세 파라미터 구성
      const insertParams = [
        detail.emp_code,
        detail.line_code,
        detail.planned_qtt,
        detail.prdp_code,
        detail.prdp_d_code,
        detail.priority,
        detail.prod_code
      ];

      await mariadb.queryConn(conn, "insertPrdpDetail", insertParams);
    }

    await conn.commit(); // 커밋
    return result;

  } catch (err) {
    await conn.rollback(); // 롤백
    console.error('❌ 트랜잭션 실패:', err);
    throw err;
  } finally {
    conn.release(); // 연결 해제
  }
};

const updateProductionTx = async (data) => {
  // console.log('convert ======================================================')
  // console.log(convertObjToAry(data.prdpData, ['prdp_name','due_date','note','start_date','end_date','prdp_code']));
  // console.log('convert ======================================================')
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction(); // 트랜잭션 BEGIN;

    // 1. 메인 생산계획 정보 수정

    const prdpData = convertObjToAry(data.prdpData, ['prdp_name','due_date','note','start_date','end_date','prdp_code']);
    const result = await mariadb.queryConn(conn, "updatePrdp", prdpData);


    // 2. 상세 생산계획 항목들 수정
    for (const values of data.detailData) {
      const detailData = convertObjToAry(values, ['emp_code', 'line_code', 'planned_qtt', 'priority', 'prod_code', 'prdp_d_code']);
      await mariadb.queryConn(conn, "updatePrdpDetail", detailData);
    }

    await conn.commit(); // 커밋
    return result;
  }
  catch (err) {
    await conn.rollback();
    console.error('트랜잭션 실패:', err);
    throw err;
  }
  finally {
    conn.release();
  }
};
module.exports ={
    // 해당 객체에 등록해야지 외부로 노출
    findAll,
    selectMonth,
    findDetail,
    findOrder,
    findLineByType,
    findProd,
    searchPrdp,
    insertProductionTx,
    updateProductionTx,
};