// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");
const minsql = require("../database/sqls/min.js");
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

// 날짜 조건을 반영한 자재입고 조회
const findMinsWithDate = async (fromDate, toDate) => {
  try {
    const result = await mariadb.query("selectOrderListWithDate", [fromDate, toDate]);
    return result;
  } catch (err) {
    console.error("조회 실패:", err);
    throw err;
  }
};

// 자재 전체 조회
const findAllMat = async () => {
  const result = await mariadb.query("selectAllMatList")
    .catch(err => console.log(err));
  return result;
};

// 선택 자재 조회
const findSelMat = async (mat) => {
  const result = await mariadb.query("selectSearchMat", mat)
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

    // minbnd_code 생성
    const newMinCode = await mariadb.queryConn(conn, "selectMinCodeForUpdate");
   
    // lot_num 생성
    console.log(data.mat_type);

    let newLotNum ='';
    if(data.mat_type === 't1' || data.mat_type === 'i4') {
      newLotNum = await conn.query(minsql.selectLotNumForUpdateOne);
      await conn.query(minsql.insertMatLOT, [
      newLotNum[0].lot_num,
      data.mat_type,
      data.mat_code,
      ]);
    } else if (data.mat_type === 't2' || data.mat_type === 'i3') {
        newLotNum = await conn.query(minsql.selectLotNumForUpdateTwo);
        await conn.query(minsql.insertMatLOT, [
        newLotNum[0].lot_num,
        data.mat_type,
        data.mat_code,
      ]);
    } 

    console.log('lot값 체크');
    console.log(newLotNum[0].lot_num);

    // console.log(newMinCode[0].minbnd_code);
    // console.log(newLotNum[0].lot_num);
    // console.log(data);
     
    const result = await conn.query(minsql.insertMinBnd, [
      newMinCode[0].minbnd_code,
      data.mat_code,
      data.mat_type,
      data.unit,
      data.inbnd_qtt,
      data.inbnd_date,
      data.ord_qtt,
      data.qio_code,
      newLotNum[0].lot_num,
      data.mat_sup,
      data.mcode,
    ]);

    await conn.commit();
    console.log('자재입고정보 등록 성공');
    return result;
  } catch (err){
    await conn.rollback();
    // console.log('오류발생');
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
    findMinsWithDate,
    findAllQio,
    findAllMat,
    findSelMat,

    /* 등록 */
    insertMin,
    insertMinAll,
    
    /* 삭제 */
    deleteMpr,
};