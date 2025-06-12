const mariadb = require("../database/mapper.js");
const eqQueries = require('../database/sqls/eq.js');
const { convertObjToAry } = require('../utils/converts.js');

// 조건 없이 mrp 전체조회
const findAll = async () => {
  let list = await mariadb.query("selectEqList")
                          .catch(err => console.log(err));
  return list;
};

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
  try {
    // 1단계: 설비 정보 등록
    const eqValues = [
      eqData.eq_code,
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
      eqData.chk_cycle
    ];

    const eqResult = await mariadb.query("insertEq", eqValues);
    
    return eqResult;
  } catch (err) {
    console.log(err);
    throw err;
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
      eqData.chk_cycle,
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

const deleteMultiple = async (eqCodes) => {
  const results = [];
  for(const eqCode of eqCodes) {
    const result = await mariadb.query("deleteEq", [eqCode])
                                .catch(err => console.log(err));
    results.push(result);
  }
  return results;
}

module.exports = {
    findAll,
    searchEquipment,
    findByCode,
    insertEq,
    updateEq,
    deleteEq,
    deleteMultiple
};