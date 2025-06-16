// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../utils/converts.js');

// 📦 생산실적 목록 조회 - 이번 달 기준
const getMonthlyPerformance = async (startDate, endDate) => {
  try {
    const result = await mariadb.query('getCurrentMonthPlans', [startDate, endDate]);
    return result;
  } catch (err) {
    console.error('❌ 생산실적 조회 실패:', err);
    throw err;
  }
};

// 📌 생산실적 조건 조회 (검색)
const searchPrdr = async (params) => {
  const bindParams = [
    params.prdr_code ?? null, params.prdr_code ?? null,
    params.work_order_code ?? null, params.work_order_code ?? null,
    params.prod_name ?? null, params.prod_name ?? null,
    params.start_date ?? null, params.start_date ?? null,
    params.end_date ?? null, params.end_date ?? null,
  ];

  try {
    const result = await mariadb.query('searchPrdr', bindParams);
    return result;
  } catch (err) {
    console.error('❌ 생산실적 조건 검색 실패:', err);
    throw err;
  }
};

module.exports ={
  getMonthlyPerformance,
  searchPrdr

};