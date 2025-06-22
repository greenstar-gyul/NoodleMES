// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");
// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../utils/converts.js');

// 실제 제공할 서비스 등록 영역

// 자재입고목록 (min) 전체조회
const findAllMin = async () => {
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("selectAllMatInList")
                          .catch(err => console.log(err));
  return list;
}; // end of findAllMin

// 자재 전체 조회
const findAllMat = async () => {
  const result = await mariadb.query("selectAllMatList")
    .catch(err => console.log(err));
  return result;
};

// 품질검사정보 전체 조회
const findAllQio = async () => {
  const result = await mariadb.query("selectAllQioList")
    .catch(err => console.log(err));
  return result;
};
// end of findAllQio


// 자재입고 등록
const insertMin = async (minData) => {
  // minData는 minbnd_code부터 mcode까지 배열 형태로 전달됨
  const result = await mariadb.query("insertMin", minData)
    .catch(err => console.log(err));
  return result;
};

// 자재입고 최종등록
const insertMinAll = async (data) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();
    
    // 1. MPR 기본 등록
    const minCodeRes = await mariadb.queryConn(conn, "selectMinCodeForUpdate");
    const minCode = minCodeRes[0].minbnd_code;
    const lotNumRes = await mariadb.queryConn(conn, "selectLotNumForUpdate");
    const lotNum = lotNumRes[0].lot_num;

    const Columns = ['minbnd_code', 'mat_code', 'mat_type', 'unit', 'inbnd_qtt', 'inbnd_date', 'ord_qtt', 'qio_code', 'lot_num', 'mat_sup', 'mcode',];
    // 저장
    data.minData.minbnd_code = minCode;
    data.minData.mpr_code = lotNum;
    const result = await mariadb.queryConn(conn, "insertMinBnd", convertObjToAry(data.minData, Columns));

    await conn.commit();
    console.log('자재입고정보 등록 성공');
    return result;
  } catch (err){
    await conn.rollback();
    console.log(err);
    throw err;
  } finally {
    conn.release();
  }
}; // end of insertMinAll


//  정보 삭제
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
    /* 조회 */ 
    findAllMin,
    findAllQio,
    findAllMat,

    /* 등록 */
    insertMin,
    insertMinAll,
    
    /* 삭제 */
    deleteMpr,
};