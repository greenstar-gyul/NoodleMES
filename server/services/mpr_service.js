// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");
// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../utils/converts.js');

// 실제 제공할 서비스 등록 영역

// 자재구매요청 (MPR) 전체조회
const findAll = async () => {
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("selectAllMprList")
                          .catch(err => console.log(err));
  return list;
};

// 검색 결과 조회
const findSearch = async (values) => {  
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("selectSearchMprList", values)
                          .catch(err => console.log(err));
  return list;
};

// MPR 등록
const insertMpr = async (mprData) => {
  // mprData는 mpr_code부터 client_code까지 배열 형태로 전달됨
  const result = await mariadb.query("insertMpr", mprData)
    .catch(err => console.log(err));
  return result;
};

// MPR Detail 등록
const insertMprDetail = async (detailData) => {
  // 제품별 상세 정보 등록
  const result = await mariadb.query("insertMprD", detailData)
    .catch(err => console.log(err));
  return result;
};

// MPR 전체 등록
const insertMprAll = async(data) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();
    
    // 1. MPR 기본 등록
    const mprCodeRes = await mariadb.queryConn(conn, "selectMprCodeForUpdate");
    const mprCode = mprCodeRes[0].mpr_code;
    const masterColumns = ['mpr_code', 'reqdate', 'deadline', 'mrp_code', 'mcode', ];
    const detailColumns = ['mpr_d_code', 'mat_code', 'req_qtt', 'unit', 'mpr_code', 'mat_sup', 'note', ];
    // 주문 저장
    data.mprData.mpr_code = mprCode;
    const result = await mariadb.queryConn(conn, "insertMpr", convertObjToAry(data.mprData, masterColumns));


    // 2. MPR 상세 등록
    for (const mprd of data.detailData) {
      const mprDCodeRes = await mariadb.queryConn(conn, "selectMprDCodeForUpdate");
      const mprDCode = mprDCodeRes[0].mpr_d_code;

      mprd.mpr_code = mprCode;
      mprd.mpr_d_code = mprDCode;

      await mariadb.queryConn(conn, "insertMprD", convertObjToAry(values, detailColumns));
    }

    await conn.commit();
    console.log('MPR 등록 성공');
    return result;
  } catch {
    await conn.rollback();
    console.log(err);
    throw err;
  } finally {
    conn.release();
  }
};
// end of insertMpr

// MPR 상세 조회
const findMprDetail = async(values) => {
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("selectMprDList", values)
                          .catch(err => console.log(err));
  return list;
}
// end of findMprDetail

// MPR 정보 삭제
const deleteMpr = async (mprCode) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    await conn.beginTransaction();
    await mariadb.queryConn(conn, "deleteMprDetail", [mprCode]);
    await mariadb.queryConn(conn, "deleteMpr", [mprCode]);
    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    console.error("삭제 실패:", err);
    throw err;
  } finally {
    conn.release();
  }
};
// end of deleteMpr

module.exports ={
    findAll,
    findSearch,
    insertMpr,
    insertMprDetail,
    insertMprAll,
    findMprDetail,
    deleteMpr,
};