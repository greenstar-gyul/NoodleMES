// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");
const procsql  = require('../database/sqls/proc.js');

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../utils/converts.js');


const selectProdList = async () => {
  const list = await mariadb.query('selectProdList')
    .catch(err => {
      console.error('❌ 제품 목록 조회 실패:', err);
      return [];
    });
  return list;
};
module.exports ={
  selectProdList,
  
}