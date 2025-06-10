const mariadb = require("../database/mapper.js");
const { convertObjToAry } = require('../utils/converts.js');

// 조건 없이 mrp 전체조회
const findAll = async () => {
  let list = await mariadb.query("selectMRPList")
                          .catch(err => console.log(err));
  return list;
};

module.exports = {
    findAll,
};