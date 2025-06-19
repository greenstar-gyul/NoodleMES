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

// qio_tbl 조회
const getQioList = async () => {
  let list = await mariadb.query("getQioList")
    .catch(err => console.log(err));
  return list;
};

const searchQioListByCode = async (qioCode) => {
  let list = await mariadb.query("searchQioListByCode", [qioCode])
    .catch(err => console.log(err));
  return list;
};

const searchPrdrListByQioCode = async (qioCode) => {
  let list = await mariadb.query("selectPrdrByQioCode", [qioCode])
    .catch(err => console.log(err));
  return list;
};

// standard  기준정보 등록
const insertQlt = async (data) => {
  let list = await mariadb.query("insertQlt", data)
                          .catch(err => console.log(err));
  return list;
}
// 품질검사 등록
const insertQio = async (qioData) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    await conn.beginTransaction();
    const qioCodeRes = await mariadb.queryConn(conn, "selectQioCodeForUpdate");
    console.log('SQL 결과:', qioCodeRes);
    const generatedCode = qioCodeRes[0].next_qio_code;
    const qioValues = [
      generatedCode,
      qioData.qio_date,
      qioData.insp_date,
      qioData.prdr_code,
      qioData.purchase_code,
      qioData.emp_name
    ];
    const qioResult = await mariadb.queryConn(conn, "insertQio", qioValues);
    await conn.commit();
    return { success: true, qio_code: generatedCode };
  } catch (err) {
    await conn.rollback();
    console.log(err);
    throw err;
  } finally {
    conn.release();
  }
}

// QIR insert
const insertQir = async (qirData) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    await conn.beginTransaction();
    const qirCodeRes = await mariadb.queryConn(conn, "selectQirCodeForUpdate");
    console.log('SQL 결과:', qirCodeRes);
    const generatedCode = qirCodeRes[0].next_qir_code;
    
    const qirValues = [
      generatedCode,
      qirData.start_date,
      qirData.end_date,
      qirData.unpass_qtt,
      qirData.pass_qtt,
      qirData.unpass_rate,
      qirData.result,
      qirData.note,
      qirData.qio_code,
      qirData.qir_emp_name,
      qirData.inspection_item
    ];
    
    const qirResult = await mariadb.queryConn(conn, insertQir, qirValues);
    await conn.commit();
    return { success: true, qir_code: generatedCode };
  } catch (err) {
    await conn.rollback();
    console.log(err);
    throw err;
  } finally {
    conn.release();
  }
}

const saveQioWithResults = async (qioData, qirList) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();

    let generatedQioCode = qioData.qio_code;
    let qioResult;

    if (!generatedQioCode || generatedQioCode === '') {
      const qioCodeRes = await mariadb.queryConn(conn, "selectQioCodeForUpdate");
      generatedQioCode = qioCodeRes[0].next_qio_code;

      const qioValues = [
        generatedQioCode,
        qioData.qio_date,
        qioData.insp_date,
        qioData.prdr_code,
        qioData.purchase_code,
        qioData.emp_name
      ];

      qioResult = await mariadb.queryConn(conn, "insertQio", qioValues);
    } else {
      const qioValues = [
        qioData.qio_date,
        qioData.insp_date,
        qioData.prdr_code,
        qioData.purchase_code,
        qioData.emp_name,
        generatedQioCode
      ];
      qioResult = await mariadb.queryConn(conn, "updateQio", qioValues);
    }

    // 기존 QIR 조회
    let existingQirs = [];
    if (qioData.qio_code) {
      existingQirs = await mariadb.queryConn(conn, "selectQirCodesByQioCode", [generatedQioCode]);
    }

    const currentQirCodes = qirList.filter(item => item.qir_code && item.qir_code !== '').map(item => item.qir_code);
    const deletedQirCodes = existingQirs.map(item => item.qir_code).filter(code => !currentQirCodes.includes(code));

    for (const deletedCode of deletedQirCodes) {
      await mariadb.queryConn(conn, "deleteQir", [deletedCode]);
    }

    const qirResults = [];
    for (const qirData of qirList) {
      if (qirData.qir_code && qirData.qir_code !== '') {
        const qirValues = [
          qirData.start_date,
          qirData.end_date,
          qirData.unpass_qtt,
          qirData.pass_qtt,
          qirData.unpass_rate,
          qirData.result,
          qirData.note,
          generatedQioCode,
          qirData.qir_emp_name,
          qirData.inspection_item,
          qirData.qir_code
        ];
        const qirResult = await mariadb.queryConn(conn, "updateQir", qirValues);
        qirResults.push(qirResult);
      } else {
        const qirCodeRes = await mariadb.queryConn(conn, "selectQirCodeForUpdate");
        const generatedQirCode = qirCodeRes[0].next_qir_code;

        const qirValues = [
          generatedQirCode,
          qirData.start_date,
          qirData.end_date,
          qirData.unpass_qtt,
          qirData.pass_qtt,
          qirData.unpass_rate,
          qirData.result,
          qirData.note,
          generatedQioCode,
          qirData.qir_emp_name,
          qirData.inspection_item
        ];
        const qirResult = await mariadb.queryConn(conn, "insertQir", qirValues);
        qirResults.push(qirResult);
      }
    }

    await conn.commit();
    return {
      result_code: "SUCCESS",
      qio_code: generatedQioCode,
      qio_result: qioResult,
      qir_results: qirResults,
      deleted_count: deletedQirCodes.length
    };
  } catch (err) {
    await conn.rollback();
    console.error(err);
    throw err;
  } finally {
    conn.release();
  }
};

const deleteQioWithResults = async (qioCode) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    await conn.beginTransaction();

    const existingQirs = await mariadb.queryConn(conn, "selectQirCodesByQioCode", [qioCode]);
    for (const item of existingQirs) {
      await mariadb.queryConn(conn, "deleteQir", [item.qir_code]);
    }

    const result = await mariadb.queryConn(conn, "deleteQio", [qioCode]);

    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    console.error('❌ QIO 일괄 삭제 실패:', err);
    throw err;
  } finally {
    conn.release();
  }
};

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
        qcr_code, // ✅ 여기!
        data.inspection_item,
        data.range_top,
        data.range_bot,
        data.com_value,
        data.unit,
        data.note,
        data.check_method,
        data.regdate_from,
        data.regdate_to,
        data.is_used
      ]);
    // }

    await conn.commit();
    return { success: true, qcr_codes: insertedQcrCodes };

  } catch (err) {
    await conn.rollback();
    console.error(':x: 품질 기준 등록 실패:', err);
    throw err;
  } finally {
    conn.release();
  }
};

const getQirList = async () => {
  let list = await mariadb.query("selectQir")
    .catch(err => console.log(err));
  return list;
}
  

module.exports = {
  // 해당 객체에 등록해야지 외부로 노출
  findAll,
  insertQlt,
  insertQcrTx,
  getQioList,
  getQirList,
  searchQioListByCode,
  searchPrdrListByQioCode,
  insertQio,
  insertQir,
  saveQioWithResults,
  deleteQioWithResults
}

