// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");

//
const qcrSql = require("../database/sqls/qlt.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../utils/converts.js');

// 실제 제공할 서비스 등록 영역

// 조건 없이 전체조회
const findAll = async () => {
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("selectAll")
                          .catch(err => console.log(err));
  return list;
};


// standard  기준정보 등록
const insertQlt = async (data) => {
  let list = await mariadb.query("insertQlt", data)
                          .catch(err => console.log(err));
  return list;
}

const insertQcrTx = async (qcrDataList) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    const data = qcrDataList;
    await conn.beginTransaction();
    const insertedQcrCodes = [];

    // for (const data of qcrDataList) {
      console.log('처리 중인 데이터:', data);

      let selectCodeQuery = '';

      if (['i1', 'i2'].includes(data.com_value)) {
        selectCodeQuery = qcrSql.selectQcrcodeProd;
      } else if (data.com_value === 'i4') {
        selectCodeQuery = qcrSql.selectQcrCodeMat;
      } else {
        throw new Error(`알 수 없는 com_value: ${data.com_value}`);
      }

      const [codeRow] = await conn.query(selectCodeQuery);
      if (!codeRow) {
        throw new Error('코드 생성 쿼리 결과가 없습니다.');
      }

      const qcr_code = Object.values(codeRow)[0];
      console.log('생성된 코드:', qcr_code);

      insertedQcrCodes.push(qcr_code);

      // ❗ 여기만 수정함: 자동 생성된 qcr_code를 사용
      await conn.query(qcrSql.insertQcr, [
  qcr_code,
  data.inspection_item,
  data.range_top,
  data.range_bot,
  data.unit,
  data.note,
  data.check_method,
  data.regdate,   // IFNULL 처리를 쿼리문에서 함
  data.com_value
]);
    // }

    await conn.commit();
    return { success: true, qcr_codes: insertedQcrCodes };

  } catch (err) {
    await conn.rollback();
    console.error('❌ 품질 기준 등록 실패:', err);
    throw err;
  } finally {
    conn.release();
  }
};

module.exports ={
    // 해당 객체에 등록해야지 외부로 노출
    findAll,
    insertQlt,
    insertQcrTx
}