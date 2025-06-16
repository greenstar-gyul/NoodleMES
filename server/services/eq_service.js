const mariadb = require("../database/mapper.js");
const eqQueries = require('../database/sqls/eq.js');
const { convertObjToAry } = require('../utils/converts.js');

// 조건 없이 mrp 전체조회
const findAll = async () => {
  let list = await mariadb.query("selectEqList")
                          .catch(err => console.log(err));
  return list;
};

// 설비 점검 지시서 조회 팝업
const showEqii = async () => {
  let list = await mariadb.query("selectEqiiList")
                          .catch(err => console.log(err));
  return list;
};

// 설비 점검 기준 항목 전체 조회
const showEqiType = async () => {
  let list = await mariadb.query("selectEqiType")
                          .catch(err => console.log(err));
  return list;
};


// 설비 점검 지시서 조회 팝업 (eqir_code로 조회)
const searchEqiType = async (eqType) => {
  let list = await mariadb.query("selectEqitList", [eqType])
                          .catch(err => console.log(err));
  return list;
}

const showEqir = async (eqirCode) => {
  let list = await mariadb.query("selectEqirList", [eqirCode])
                          .catch(err => console.log(err));
  return list;
}

const searchEquipment = async (searchParams) => {
  const { sql, values } = eqQueries.buildSearch(searchParams);

  const result = await mariadb.queryDirect(sql, values)
                              .catch(err => console.log(err));
  return result;
};

const findByCode = async (eqCode) => {
  const result = await mariadb.query("selectEqByCode", [eqCode])
                              .catch(err => console.log(err));
  return result && result.length > 0 ? result[0] : null;
};

const insertEq = async (eqData) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();
    // 1단계: 설비 정보 등록
    const eqCodeRes = await mariadb.queryConn(conn, "selectEqCodeForUpdate", [eqData.eq_type, eqData.eq_type, eqData.eq_type]);
    console.log('SQL 결과:', eqCodeRes);
    const generatedCode = eqCodeRes[0].next_eq_code;
    const eqValues = [
      generatedCode,
      eqData.eq_name,
      eqData.eq_model,
      eqData.eq_maker,
      eqData.capacity,
      eqData.stat,
      eqData.eq_make_date,
      eqData.bring_date,
      eqData.take_date,
      eqData.eq_pos,
      eqData.eq_type,
      eqData.is_used
    ];

    const eqResult = await mariadb.queryConn(conn, "insertEq", eqValues);
    await conn.commit();
    return eqResult;
  } catch (err) {
    await conn.rollback();
    console.log(err);
    throw err;
  }
  finally {
    conn.release();
  }
};

// 설비 수정 (점검주기도 함께)
const updateEq = async (eqCode, eqData) => {
  try {
    // 1단계: 설비 정보 수정
    const eqValues = [
      eqData.eq_name,
      eqData.eq_model,
      eqData.eq_maker,
      eqData.capacity,
      eqData.stat,
      eqData.eq_make_date,
      eqData.bring_date,
      eqData.take_date,
      eqData.eq_pos,
      eqData.eq_type,
      eqData.is_used,
      eqCode
    ];

    const eqResult = await mariadb.query("updateEq", eqValues);
    
    return eqResult;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteEq = async (eqCode) => {
  const result = await mariadb.query("deleteEq", [eqCode])
                              .catch(err => console.log(err));
  return result;
};

const selectEqiiStatus = async (eqiiCode) => {
  const result = await mariadb.query("selectEqiistatus", [eqiiCode])
                              .catch(err => console.log(err));
  return result && result.length > 0 ? result[0].stat : null;
};

const deleteMultiple = async (eqCodes) => {
  const conn = await mariadb.connectionPool.getConnection();

  try{
    await conn.beginTransaction();

    const results = [];
    for(const eqCode of eqCodes) {
      const result = await mariadb.query("deleteEq", [eqCode])
                                  .catch(err => console.log(err));
      results.push(result);
    }
    await conn.commit();
    return results;
  }
  catch (err) {
    await conn.rollback();
    console.error('트랜잭션 실패:', err);
    throw err;
  }
  finally {
    conn.release();
  }
}

module.exports = {
    findAll,
    searchEquipment,
    findByCode,
    insertEq,
    updateEq,
    deleteEq,
    deleteMultiple,
    showEqii,
    showEqir,
    showEqiType,
    searchEqiType,
    selectEqiiStatus
};