const mariadb = require("../database/mapper.js");
const eqQueries = require('../database/sqls/eqichk.js');
const { convertObjToAry } = require('../utils/converts.js');

// 조건 없이 mrp 전체조회
const findAll = async () => {
  let list = await mariadb.query("selectEqiChkTypeList")
                          .catch(err => console.log(err));
  return list;
};

const searchEqChkType = async (params) => {
  // null이나 undefined도 체크해서 null로 맞춰주기
  const bindParams = [
    params.chk_type_code ?? null, params.chk_type_code ?? null,
    params.eq_type ?? null, params.eq_type ?? null,
    params.chk_text ?? null, params.chk_text ?? null,
    params.chk_mth ?? null, params.chk_mth ?? null
  ];

  const list = await mariadb.query("searchEqiChkType", bindParams)
                            .catch(err => console.log(err));
  return list;
};

const findByCode = async (chktypeCode) => {
  const result = await mariadb.query("selectEqiChkTypeByCode", [chktypeCode])
                              .catch(err => console.log(err));
  return result && result.length > 0 ? result[0] : null;
};

const insertEqiChkType = async (chktypeData) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();
    // 1단계: 설비 정보 등록
    const chktypeCodeRes = await mariadb.queryConn(conn, "selectEqiChkCodeForUpdate", [chktypeData.eq_type, chktypeData.eq_type, chktypeData.eq_type]);
    console.log('SQL 결과:', chktypeCodeRes);
    const generatedCode = chktypeCodeRes[0].next_chk_type_code;
    const ectValues = [
      generatedCode,
      chktypeData.eq_type,
      chktypeData.chk_text,
      chktypeData.chk_mth,
      chktypeData.range_top,
      chktypeData.range_bot,
      chktypeData.unit,
      chktypeData.jdg_mth,
      chktypeData.regdate,
      chktypeData.crrdate,
      chktypeData.note
    ];

    const ectResult = await mariadb.queryConn(conn, "insertEqiChkType", ectValues);
    await conn.commit();
    return ectResult;
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
const updateEqiChkType = async (chktypeCode, chktypeData) => {
  try {
    // 1단계: 설비 정보 수정
    const ectValues = [
      chktypeData.eq_type,
      chktypeData.chk_text,
      chktypeData.chk_mth,
      chktypeData.range_top,
      chktypeData.range_bot,
      chktypeData.unit,
      chktypeData.jdg_mth,
      chktypeData.regdate,
      chktypeData.crrdate,
      chktypeData.note,
      chktypeCode
    ];

    const ectResult = await mariadb.query("updateEqiChkType", ectValues);
    
    return ectResult;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteEqiChkType = async (chktypeCode) => {
  const result = await mariadb.query("deleteEqiChkType", [chktypeCode])
                              .catch(err => console.log(err));
  return result;
};

const deleteMultiple = async (chktypeCodes) => {
  const conn = await mariadb.connectionPool.getConnection();

  try{
    await conn.beginTransaction();

    const results = [];
    for(const chktypeCode of chktypeCodes) {
      const result = await mariadb.query("deleteEqiChkType", [chktypeCode])
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
    searchEqChkType,
    findByCode,
    insertEqiChkType,
    updateEqiChkType,
    deleteEqiChkType,
    deleteMultiple
};