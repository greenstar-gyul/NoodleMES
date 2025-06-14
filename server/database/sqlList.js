// 각 테이블 별로 실행한 SQL문을 별도 파일로 작성
const depts = require('./sqls/depts.js');
const prdps = require('./sqls/prdps.js');
const mrp = require('./sqls/mrp.js');
const eq = require('./sqls/eq.js');
const eqichk = require('./sqls/eqichk.js');
const orders = require('./sqls/orders.js');
const mpr = require('./sqls/mpr.js');
const qlt = require('./sqls/qlt.js');
const line = require('./sqls/line.js');
const wko = require('./sqls/wko.js');
const prdr = require('./sqls/prdr.js');

module.exports = {
  // 펼침연산자(spread operator, ...)을 활용해 객체의 필드를 다른 객체로 쉽게 복사
  ...depts,
  ...mrp,
  ...mpr,
  ...prdps,
  ...eq,
  ...eqichk,
  ...orders,
  ...qlt,
  ...line,
  ...wko,
  ...prdr,
}

/*
 {
   selectBookList : '';
   bookInsert : '';
 }
*/