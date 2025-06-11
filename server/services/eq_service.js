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
  const values = [
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
      eqData.is_used
    ];

    const result = await mariadb.query("insertEq", values);
    return result;
};

const updateEq = async (eqCode, eqData) => {
  const values = [
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
      eqCode
    ];

    const result = await mariadb.query("udpateEq", values);
    return result;
};

const deleteEq = async (eqCode) => {
  const result = await mariadb.query("deleteEq", [eqCode]);
  return result;
};

const deleteMultiple = async (eqCodes) => {
  const results = [];
  for(const eqCode of eqCodes) {
    const result = await mariadb.query("deleteEq", [eqCode]);
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