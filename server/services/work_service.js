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


module.exports = {
  findAll,
};