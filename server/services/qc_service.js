const mariadb = require('../database/mapper.js');

// 검사지시서 전체 조회
const getAllInspectionOrders = async () => {
  try {
    const result = await mariadb.query('selectAllQIO');
    return result;
  } catch (err) {
    console.error('❌ QIO 조회 실패:', err);
    throw err;
  }
};

// 검사결과 전체 조회
const getAllInspectionResults = async () => {
  try {
    const result = await mariadb.query('selectAllQIR');
    return result;
  } catch (err) {
    console.error('❌ QIR 조회 실패:', err);
    throw err;
  }
};

module.exports = {
  getAllInspectionOrders,
  getAllInspectionResults,
};