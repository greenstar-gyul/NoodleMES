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
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("getCurrentMonthPlans")
                          .catch(err => console.log(err));
  return list;
};
// 라인 조건 없이 전체조회
const findLine = async () => {
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("selectLineList")
                          .catch(err => console.log(err));
  return list;
};
// 제품 조건 없이 전체조회
const findProd = async () => {
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("selectProdList")
                          .catch(err => console.log(err));
  return list;
};

// 제품 조건 없이 전체조회
const findDetail = async (prdpCode) => {
  try {
    const result = await mariadb.query("selectPrdpDOne", [prdpCode]);
    return result; // 단건이라면 첫 번째 값만 리턴
  } catch (err) {
    console.error('findDetail 오류:', err);
    throw err;
  }
};

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

// 등록 트렌잭션 
const insertProductionTx = async (data) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction(); // 트랜잭션 BEGIN;

    // 주문 코드 새로 생성해 가져오기.
    const prdpCodeRes = await mariadb.queryConn(conn, "selectPrdpCodeForUpdate"); // 트랜잭션 발생 및 잠그기

    const prdpCode = prdpCodeRes[0].prdp_code;
    console.log('>> insertPrdp payload:', data.prdpData);

    // 주문 저장
    data.prdpData.prdp_code = prdpCode;
    const result = await mariadb.queryConn(conn, "insertPrdp", data.prdpData); // 메인 등록: 주문서

    // 트랜잭션 내에서 실행
    for (const values of data.detailData) { // 주문서 상세
      values.prdp_code = prdpCode;
      await mariadb.queryConn(conn, "insertPrdpDetail", values);
    }

    // 커밋 수행
    await conn.commit();

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

// 삭제 트렌잭션 수정필요 
const deleteProductionTx = async (data) => {
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
    findLine,
    findProd,
    searchPrdp,
    insertProductionTx,
    updateProductionTx,
    deleteProductionTx
};