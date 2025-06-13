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
const insertMpr = async(body) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    const { mpr, mprds } = body;
    await conn.beginTransaction();
    
        // 1. MPR 본문 등록
    await conn.query(mprSql.insertMpr, [
      mpr.mpr_code,
      mpr.redate,
      mpr.deadline,
      mpr.mrp_code,
      mpr.mcode
    ]);

    // 2. MPR 상세 리스트 등록
    for (const mprd of mprds) {
      await conn.query(mprSql.insertMprD, [
        mprd.mpr_d_code,
        mprd.mat_code,
        mprd.req_qtt,
        mprd.unit,
        mpr.mpr_code,
        mprd.mat_sup,
        mprd.note
      ]);
    }

    await conn.commit();
    console.log('MPR 등록 성공');
    
  } catch {
    await conn.rollback();
    console.log(err);
    throw err;
  } finally {
    conn.release();
  }
};
// end of insertMpr

const findMprDetail = async(values) => {
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("selectMprDList", values)
                          .catch(err => console.log(err));
  return list;

}

module.exports ={
    // 해당 객체에 등록해야지 외부로 노출
    findAll,
    findSearch,
    insertMpr,
    findMprDetail,
};