const mariadb = require("../database/mapper.js");
const { convertObjToAry } = require('../utils/converts.js');

const codeMapper = {
  '단위': '0H',
  '0H': {
    'kg': 'h1',
    't': 'h2',
    'L': 'h3',
    'ea': 'h4',
    'box': 'h5',
    'g': 'h6',
    'mm': 'h7',
    '%': 'h8',
    'cm': 'h9',
    'N': 'ha',
  },
  '작업상태': '0V',
  '0V': {
    '대기': 'v4',
    '진행중': 'v1',
    '완료': 'v2',
    '중단': 'v3',
  }
}

/**
 * 조건 없이 작업지시서 전체조회
 */
const findAll = async () => {
  const list = await mariadb.query("selectWKOList")
    .catch(err => console.log(err));
  return list;
};

// 📦 작업진행 목록 조회 - 이번 달 기준
const getMonthlyPerformance = async (startDate, endDate) => {
  try {
    const result = await mariadb.query('getCurrentMonthPlan', [startDate, endDate]);
    return result;
  } catch (err) {
    console.error('❌ 생산실적 조회 실패:', err);
    throw err;
  }
};

// 작업 진행 조건 검색
const searchWorkingList = async (params) => {
  const {
    wko_code = null,
    prod_name = null,
    line_code = null,
    reg_date_from = null,
    reg_date_to = null
  } = params;

  // NULL로 들어가야 할 값은 명확히 null 처리
  const paramArray = [
    wko_code, wko_code,
    prod_name, prod_name,
    line_code, line_code,
    reg_date_from, reg_date_to, reg_date_from, reg_date_to
  ];

  try {
    const result = await mariadb.query('searchWorkingList', paramArray);
    return result;
  } catch (err) {
    console.error('❌ 작업지시서 검색 실패:', err);
    throw err;
  }
};


module.exports = {
  findAll,
  getMonthlyPerformance,
  searchWorkingList
}