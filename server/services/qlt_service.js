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

const formatDateForDB = (date) => {
  if (!date) return null;

  let dateObj;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return null;
  }

  if (isNaN(dateObj.getTime())) {
    console.warn('잘못된 날짜 형식:', date);
    return null;
  }

  // YYYY-MM-DD 형식
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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

const searchMprListByQioCode = async (qioCode) => {
  let list = await mariadb.query("selectMprByQioCode", [qioCode])
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

    const qirResult = await mariadb.queryConn(conn, "insertQir", qirValues);
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
    console.log('🔍 service.js 시작!');
    console.log('📥 받은 qioData:', JSON.stringify(qioData, null, 2));
    console.log('📥 받은 qirList:', JSON.stringify(qirList, null, 2));

    await conn.beginTransaction();
    console.log('✅ 트랜잭션 시작 완료');

    let generatedQioCode = qioData.qio_code;
    let qioResult;

    if (!generatedQioCode || generatedQioCode === '') {
      console.log('🆕 QIO 신규 등록 시작');

      // QIO 코드 생성
      console.log('🔍 QIO 코드 생성 쿼리 실행...');
      const qioCodeRes = await mariadb.queryConn(conn, "selectQioCodeForUpdate");
      generatedQioCode = qioCodeRes[0].next_qio_code;
      console.log('✅ 생성된 QIO 코드:', generatedQioCode);

      const qioValues = [
        generatedQioCode,
        qioData.qio_date || null,
        qioData.insp_date || null,
        qioData.prdr_code || null,
        qioData.po_name || null,
        qioData.mpr_d_code || null,
        qioData.emp_name || '정품질'
      ];

      console.log('🔍 QIO 신규 등록 파라미터:', qioValues);
      console.log('🔍 insertQio 쿼리 실행...');
      qioResult = await mariadb.queryConn(conn, "insertQio", qioValues);
      console.log('✅ QIO 신규 등록 완료:', qioResult);
    } else {
      console.log('🔄 QIO 기존 수정 시작');

      const qioValues = [
        qioData.qio_date || null,
        qioData.insp_date || null,
        qioData.prdr_code || null,
        qioData.po_name || null,
        qioData.mpr_d_code || null,
        qioData.emp_name || '정품질',
        generatedQioCode
      ];

      console.log('🔍 QIO 수정 파라미터:', qioValues);
      console.log('🔍 updateQio 쿼리 실행...');
      qioResult = await mariadb.queryConn(conn, "updateQio", qioValues);
      console.log('✅ QIO 수정 완료:', qioResult);
    }

    console.log('🔍 기존 QIR 조회 시작...');
    // 기존 QIR 조회
    let existingQirs = [];
    if (qioData.qio_code) {
      try {
        console.log('🔍 selectQirCodesByQioCode 쿼리 실행 직전'); // 🆕 추가!
        existingQirs = await mariadb.queryConn(conn, "selectQirCodesByQioCode", [qioData.qio_code]);
        console.log('✅ 기존 QIR 조회 성공!'); // 🆕 추가!
        console.log('🔍 조회된 기존 QIR들:', JSON.stringify(existingQirs, null, 2)); // 🆕 추가!
      } catch (qirSelectError) {
        console.log('❌ 기존 QIR 조회 실패!'); // 🆕 수정!
        console.log('❌ 에러 상세:', qirSelectError); // 🆕 추가!
        console.log('❌ SQL State:', qirSelectError.sqlState); // 🆕 추가!
        console.log('❌ Error Code:', qirSelectError.code); // 🆕 추가!
        existingQirs = [];
      }
    } else {
      console.log('⚠️ qioData.qio_code가 없음!'); // 🆕 추가!
    }

    // 삭제할 QIR 처리
    console.log('🗑️ 삭제할 QIR 처리 시작...');
    const currentQirCodes = qirList
      .filter(item => item.qir_code && item.qir_code !== '' && !item.qir_code.startsWith('QIR-TEMP-'))
      .map(item => item.qir_code);

    const deletedQirCodes = existingQirs
      .map(item => item.qir_code)
      .filter(code => !currentQirCodes.includes(code));

    console.log('🔍 삭제할 QIR 코드들:', deletedQirCodes);

    for (const deletedCode of deletedQirCodes) {
      console.log('🗑️ QIR 삭제 실행:', deletedCode);
      await mariadb.queryConn(conn, "deleteQir", [deletedCode]);
    }

    // QIR 처리
    console.log('📝 QIR 처리 시작... 총', qirList.length, '건');
    const qirResults = [];

    for (let i = 0; i < qirList.length; i++) {
      const qirData = qirList[i];
      console.log(`🔍 QIR ${i + 1}/${qirList.length} 처리:`, qirData.qir_code);

      if (qirData.qir_code &&
        qirData.qir_code !== '' &&
        qirData.qir_code.match(/^QIR-\d{3}$/)) {
        console.log('🔄 기존 QIR 수정 시작:', qirData.qir_code);

        const qirValues = [
          formatDateForDB(qirData.start_date) || null,
          formatDateForDB(qirData.end_date) || null,
          qirData.unpass_qtt || 0,
          qirData.pass_qtt || 0,
          qirData.unpass_rate || 0,
          qirData.result || null,
          qirData.note || null,
          generatedQioCode,
          // 🎯 여기가 핵심! 3개 파라미터로 변경
          qirData.qir_emp_code || null,        // 첫 번째: qir_emp_code (CASE 조건용)
          qirData.qir_emp_name || '정품질',     // 두 번째: qir_emp_name (이름으로 찾기용)
          qirData.qir_emp_code || null,        // 세 번째: qir_emp_code (그대로 사용용)
          qirData.inspection_item || null,
          qirData.qir_code
        ];

        console.log('🔍 QIR 수정 파라미터:', qirValues);
        const qirResult = await mariadb.queryConn(conn, "updateQir", qirValues);
        console.log('✅ QIR 수정 완료:', qirResult);
        qirResults.push(qirResult);
      } else {
        console.log('🆕 새 QIR 등록 시작:', qirData.qir_code);

        // QIR 코드 생성
        console.log('🔍 QIR 코드 생성 쿼리 실행...');
        const qirCodeRes = await mariadb.queryConn(conn, "selectQirCodeForUpdate");
        const generatedQirCode = qirCodeRes[0].next_qir_code;
        console.log('✅ 생성된 QIR 코드:', generatedQirCode);

        // 🆕 새 QIR 등록 부분
        const qirValues = [
          generatedQirCode,
          formatDateForDB(qirData.start_date) || null,
          formatDateForDB(qirData.end_date) || null,
          qirData.unpass_qtt || 0,
          qirData.pass_qtt || 0,
          qirData.unpass_rate || 0,
          qirData.result || null,
          qirData.note || null,
          generatedQioCode,
          // 🎯 여기도 3개 파라미터로 변경
          qirData.qir_emp_code || null,        // 첫 번째: qir_emp_code (CASE 조건용)
          qirData.qir_emp_name || '정품질',     // 두 번째: qir_emp_name (이름으로 찾기용)
          qirData.qir_emp_code || null,        // 세 번째: qir_emp_code (그대로 사용용)
          qirData.inspection_item || null
        ];

        console.log('🔍 QIR 신규 등록 파라미터:', qirValues);
        console.log('🎯 임시코드', qirData.qir_code, '→ 실제코드', generatedQirCode);
        console.log('🔍 insertQir 쿼리 실행...');
        const qirResult = await mariadb.queryConn(conn, "insertQir", qirValues);
        console.log('✅ QIR 신규 등록 완료:', qirResult);
        qirResults.push(qirResult);
      }
    }

    console.log('🔍 커밋 실행...');
    await conn.commit();
    console.log('✅ 모든 저장 완료!');

    const result = {
      result_code: "SUCCESS",
      qio_code: generatedQioCode,
      qio_result: qioResult,
      qir_results: qirResults,
      deleted_count: deletedQirCodes.length
    };

    console.log('🎉 최종 결과:', result);
    return result;

  } catch (err) {
    console.error('🚨 service.js 에러 발생!');
    console.error('🚨 에러 타입:', err.constructor.name);
    console.error('🚨 에러 메시지:', err.message);
    console.error('🚨 에러 스택:', err.stack);
    console.error('🚨 SQL 상태:', err.sqlState);
    console.error('🚨 에러 코드:', err.code);

    await conn.rollback();
    console.log('🔄 롤백 완료');
    throw err;
  } finally {
    conn.release();
    console.log('🔌 커넥션 해제 완료');
  }
};

const updateQir = async (qirData) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    await conn.beginTransaction();

    const qirValues = [
      formatDateForDB(qirData.start_date),      // 🔥 변환!
      formatDateForDB(qirData.end_date),        // 🔥 변환!
      qirData.unpass_qtt,
      qirData.pass_qtt,
      qirData.unpass_rate,
      qirData.result,
      qirData.note,
      qirData.qio_code,
      qirData.qir_emp_name,
      qirData.inspection_item,
      qirData.qir_code  // WHERE 조건
    ];

    const qirResult = await mariadb.queryConn(conn, "updateQir", qirValues);
    await conn.commit();
    return { success: true, affected_rows: qirResult.affectedRows };
  } catch (err) {
    await conn.rollback();
    console.log(err);
    throw err;
  } finally {
    conn.release();
  }
}

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

// const insertPinbnd = `
// INSERT INTO pinbnd_tbl (
//     pinbnd_code,
//     qtt,
//     pinbnd_date,
//     note,
//     qir_code,
//     mcode,
//     prod_code,
//     lot_num)
//     VALUES (?, ?, ?, ?, ?, (SELECT emp_code FROM emp_tbl WHERE qir_emp_code = ?), (SELECT prod_code FROM prod_tbl WHERE prod_name = ?), ?);
// `;

const getProdCodeByName = async (prodName) => {
  if (!prodName) {
    console.warn('❗ prodName이 제공되지 않았습니다.');
    return null;
  }
  try {
    const result = await mariadb.query("getProdCodeByName", [prodName])
      .catch(err => {
        console.error(`❌ ${prodName}에 대한 제품 코드 조회 실패:`, err);
        throw err;
      });
    if (result.length === 0) {
      console.warn(`❗ 제품 이름 "${prodName}"에 대한 코드가 없습니다.`);
      return null;
    }
    console.log(`✅ 제품 코드 조회 완료 (${prodName}):`, result[0].prod_code);
    return result[0].prod_code;
  } catch (error) {
    console.error('❌ 제품 코드 조회 서비스 실패:', error);
    return null;
  }
};

const getEmpCodeByQirEmpCode = async (qirEmpCode) => {
  if (!qirEmpCode) {
    console.warn('❗ qirEmpCode가 제공되지 않았습니다.');
    return 'EMP-10001'; // 기본값으로 사용
  }
  try {
    const result = await mariadb.query("selectEmpCodeByQirEmpCode", [qirEmpCode])
      .catch(err => {
        console.error('❌ 직원 코드 조회 실패:', err);
        throw err;
      });
    if (result.length === 0) {
      console.warn(`❗ 직원 코드 "${qirEmpCode}"에 대한 정보가 없습니다.`);
      return 'EMP-10001'; // 기본값으로 사용
    }
    console.log(`✅ 직원 코드 조회 완료 (${qirEmpCode}):`, result[0].emp_code);
    return result[0].emp_code;
  } catch (error) {
    console.error('❌ 직원 코드 조회 서비스 실패:', error);
    return 'EMP-10001'; // 기본값으로 사용
  }
};

// const insertLot = `
// INSERT INTO lot_tbl (
//     lot_num,
//     iss_date,
//     item_type_code,
//     prod_code)
//     VALUES (?, ?, 'i1', ?);
// `;

const insertPinbnd = async (pinbndData) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    await conn.beginTransaction();
    const pinbndCodeRes = await mariadb.queryConn(conn, "selectPinbndCodeForUpdate");
    const lotnumRes = await mariadb.queryConn(conn, "selectLotNumForUpdateThree");
    const generatedCodeforPinbnd = pinbndCodeRes[0].next_pinbnd_code;
    const generatedLotNum = lotnumRes[0].next_lot_num;

    const lotValues = [
      generatedLotNum,
      formatDateForDB(pinbndData.pinbnd_date) || null,
      pinbndData.prod_code || null
    ];

    const lotResult = await mariadb.queryConn(conn, "insertLot", lotValues);

    if (lotResult.affectedRows === 0) {
      throw new Error('로트 번호 삽입 실패');
    }

    const pinbndValues = [
      generatedCodeforPinbnd,
      pinbndData.qtt || 0,
      formatDateForDB(pinbndData.pinbnd_date) || null,
      pinbndData.note || null,
      pinbndData.qir_code || null,
      pinbndData.mcode,
      pinbndData.prod_code,
      generatedLotNum
    ];

    const pinbndResult = await mariadb.queryConn(conn, "insertPinbnd", pinbndValues);

    if (pinbndResult.affectedRows === 0) {
      throw new Error('데이터 삽입 실패');
    }

    await conn.commit();

    return {
      success: true,
      pinbnd_code: generatedCodeforPinbnd,
      lot_num: generatedLotNum,
      insertId: pinbndResult.insertId
    };
  } catch (err) {
    await conn.rollback();
    console.error('❌ 품질 검사 결과 등록 실패:', err);
    throw err;
  } finally {
    conn.release();
  }
};


const getQirListByQioCode = async (qioCode) => {
  console.log('🔍 QIO별 QIR 조회:', qioCode);

  if (!qioCode) {
    return [];
  }

  try {
    let list = await mariadb.query("selectQirByQioCode", [qioCode])
      .catch(err => {
        console.error('❌ QIO별 QIR 조회 실패:', err);
        throw err;
      });

    console.log(`✅ QIO별 QIR 조회 완료 (${qioCode}):`, list.length, '건');
    return list;
  } catch (error) {
    console.error('❌ QIO별 QIR 조회 서비스 실패:', error);
    return [];
  }
};

const selectSimpleQir = async () => {
  try {
    let list = await mariadb.query("selectSimpleQir");
    console.log('✅ Qir 간단한 조회 완료:', list.length, '건');
    return list;
  } catch (error) {
    console.error('❌ Qir 간단한 조회 서비스 실패:', error);
    return [];
  }
};


const selectSimpleQirByQioCode = async (qioCode) => {
  console.log('🔍 QIO별 간단한 QIR 조회:', qioCode);
  if (!qioCode) {
    return [];
  }
  try {
    let list = await mariadb.query("selectSimpleQirByQioCode", [qioCode])
      .catch(err => {
        console.error('❌ QIO별 간단한 QIR 조회 실패:', err);
        throw err;
      });

    console.log(`✅ QIO별 간단한 QIR 조회 완료 (${qioCode}):`, list.length, '건');
    return list;
  } catch (error) {
    console.error('❌ QIO별 간단한 QIR 조회 서비스 실패:', error);
    return [];
  }
};

// ✅ QIO 목록 조회 (팝업용)
const getQioListForPopup = async () => {
  try {
    let list = await mariadb.query("getQioListForPopup")
      .catch(err => {
        console.error('❌ QIO 팝업 목록 조회 실패:', err);
        throw err;
      });

    console.log('✅ QIO 팝업 목록 조회 완료:', list.length, '건');
    return list;
  } catch (error) {
    console.error('❌ QIO 팝업 목록 조회 서비스 실패:', error);
    return [];
  }
};

const getQirInfo = async (qirCode) => {
  if (!qirCode) {
    console.warn('❗ QIR 코드가 제공되지 않았습니다.');
    return null;
  }

  try {
    let list = await mariadb.query("selectQir", [qirCode])
      .catch(err => {
        console.error('❌ QIR 정보 조회 실패:', err);
        throw err;
      });

    if (list.length === 0) {
      console.warn(`❗ QIR 코드 ${qirCode}에 대한 정보가 없습니다.`);
      return null;
    }

    console.log(`✅ QIR 정보 조회 완료 (${qirCode}):`, list[0]);
    return list[0];
  } catch (error) {
    console.error('❌ QIR 정보 조회 서비스 실패:', error);
    return null;
  }
};

const getQcrList = async () => {
  try {
    let list = await mariadb.query("selectQcrForPopup")
      .catch(err => {
        console.error('❌ 품질 기준 팝업 목록 조회 실패:', err);
        throw err;
      });

    console.log('✅ 품질 기준 팝업 목록 조회 완료:', list.length, '건');
    return list;
  } catch (error) {
    console.error('❌ 품질 기준 팝업 목록 조회 서비스 실패:', error);
    return [];
  }
}

module.exports = {
  // 해당 객체에 등록해야지 외부로 노출
  findAll,
  insertQlt,
  insertQcrTx,
  getQioList,
  getQirInfo,
  searchQioListByCode,
  searchPrdrListByQioCode,
  insertQio,
  insertQir,
  updateQir,
  getQcrList,
  convertObjToAry,
  saveQioWithResults,
  deleteQioWithResults,
  getQirListByQioCode,
  getQioListForPopup,
  formatDateForDB,
  selectSimpleQirByQioCode,
  selectSimpleQir,
  searchMprListByQioCode,
  insertPinbnd,
  getProdCodeByName,
  getEmpCodeByQirEmpCode
}