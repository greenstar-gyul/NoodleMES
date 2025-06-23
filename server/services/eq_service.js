const mariadb = require("../database/mapper.js");
const eqQueries = require('../database/sqls/eq.js');
const { convertObjToAry } = require('../utils/converts.js');
const { formatDatesInObject, formatDatesInArray } = require('../utils/dateFormatter.js');

// 조건 없이 mrp 전체조회
const findAll = async () => {
  let list = await mariadb.query("selectEqList")
    .catch(err => console.log(err));
  return list;
};

// 설비 점검 지시서 조회 팝업
const showEqii = async () => {
  let list = await mariadb.query("selectEqiiList")
    .catch(err => console.log(err));
  return formatDatesInArray(list);
};

const simpleslectEqirList = async () => {
  let list = await mariadb.query("simpleslectEqirList")
    .catch(err => console.log(err));
  return formatDatesInArray(list);
};

// 설비 점검 기준 항목 전체 조회
const showEqiType = async () => {
  let list = await mariadb.query("selectEqiType")
    .catch(err => console.log(err));
  return list;
};


// 설비 점검 지시서 조회 팝업 (eqir_code로 조회)
const searchEqiType = async (eqType) => {
  let list = await mariadb.query("selectEqitList", [eqType])
    .catch(err => console.log(err));
  return list;
}

const showEqir = async (eqirCode) => {
  let list = await mariadb.query("selectEqirList", [eqirCode])
    .catch(err => console.log(err));
  return list;
}

const searchEquipment = async (searchParams) => {
  const { sql, values } = eqQueries.buildSearch(searchParams);

  const result = await mariadb.queryDirect(sql, values)
    .catch(err => console.log(err));
  return result;
};

const findByCode = async (eqCode) => {
  const result = await mariadb.query("selectEqByCode", [eqCode])
    .catch(err => console.log(err));
  return result && result.length > 0 ? result[0] : null;
};

const insertEq = async (eqData) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    await conn.beginTransaction();
    const eqCodeRes = await mariadb.queryConn(conn, "selectEqCodeForUpdate", [eqData.eq_type, eqData.eq_type, eqData.eq_type]);
    console.log('SQL 결과:', eqCodeRes);
    const generatedCode = eqCodeRes[0].next_eq_code;
    const eqValues = [
      generatedCode,
      eqData.eq_name,
      eqData.eq_model,
      eqData.eq_maker,
      eqData.capacity,
      eqData.stat,
      eqData.eq_make_date,
      eqData.bring_date,
      eqData.take_date,
      eqData.eq_pos,
      eqData.eq_type,
      eqData.is_used
    ];
    const eqResult = await mariadb.queryConn(conn, "insertEq", eqValues);
    await conn.commit();
    return eqResult;
  } catch (err) {
    await conn.rollback();
    console.log(err);
    throw err;
  } finally {
    conn.release();
  }
};

const insertEqir = async (eqirData) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();

    const eqirCodeRes = await mariadb.queryConn(conn, "selectEqirCodeForUpdate", []);
    console.log('SQL 결과:', eqirCodeRes);
    const generatedCode = eqirCodeRes[0].next_eqir_code;

    const eqirValues = [
      generatedCode,
      eqirData.eqii_code,
      eqirData.chk_start_date,
      eqirData.chk_end_date,
      eqirData.chk_detail,
      eqirData.chk_result,
      eqirData.eqi_stat,
      eqirData.note,
      eqirData.eq_name,
      eqirData.chk_text
    ];

    const eqirResult = await mariadb.queryConn(conn, "insertEqir", eqirValues);
    await conn.commit();
    return eqirResult;
  } catch (err) {
    await conn.rollback();
    console.log(err);
    throw err;
  }
  finally {
    conn.release();
  }
};

const insertEqii = async (eqiiData) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();

    const eqiiCodeRes = await mariadb.queryConn(conn, "selectEqiiCodeForUpdate", []);
    console.log('SQL 결과:', eqiiCodeRes);
    const generatedCode = eqiiCodeRes[0].next_eqii_code;

    const eqiiValues = [
      generatedCode,
      eqiiData.inst_date,
      eqiiData.chk_exp_date,
      eqiiData.stat,
      eqiiData.note,
      eqiiData.inst_emp_code
    ];

    const eqiiResult = await mariadb.queryConn(conn, "insertEqii", eqiiValues);
    await conn.commit();
    return eqiiResult;
  } catch (err) {
    await conn.rollback();
    console.log(err);
    throw err;
  }
  finally {
    conn.release();
  }
};

const findEqiiByCode = async (eqiiCode) => {
  const result = await mariadb.query("selectEqiiByCode", [eqiiCode])
    .catch(err => console.log(err));
  const formatted = result && result.length > 0 ? 
    formatDatesInObject(result[0]) : null;
  return formatted;
};

// 지시서 수정
const updateEqii = async (eqiiCode, eqiiData) => {
  try {
    const eqiiValues = [
      eqiiData.inst_date,
      eqiiData.chk_exp_date,
      eqiiData.stat,
      eqiiData.note,
      eqiiData.inst_emp_name || 'EMP-10001',
      eqiiCode
    ];

    const eqiiResult = await mariadb.query("updateEqii", eqiiValues);
    return eqiiResult;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const searchEqii = async (params) => {
  const bindParams = [
    params.eqii_code, params.eqii_code,
    params.stat, params.stat,  
    params.inst_emp_name, params.inst_emp_name,
    params.start_date, params.start_date,
    params.end_date, params.end_date
  ].map(param => param ?? null);

  try {
    const list = await mariadb.query("searchEqii", bindParams);
    return formatDatesInArray(list);
  } catch (err) {
    console.error('검색 오류:', err);
    return [];
  }
};

// 점검결과 수정
const updateEqir = async (eqirCode, eqirData) => {
  try {
    const eqirValues = [
      eqirData.chk_start_date,
      eqirData.chk_end_date,
      eqirData.chk_detail,
      eqirData.chk_result,
      eqirData.eqi_stat,
      eqirData.note,
      eqirCode
    ];

    const eqirResult = await mariadb.query("updateEqir", eqirValues);
    return eqirResult;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const saveEqiiWithDetails = async (eqiiData, eqirList) => {
  const conn = await mariadb.connectionPool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    let eqiiResult;
    let generatedEqiiCode = eqiiData.eqii_code;
    
    if (!eqiiData.eqii_code || eqiiData.eqii_code === '') {
      // 신규 등록
      const eqiiCodeRes = await mariadb.queryConn(conn, "selectEqiiCodeForUpdate", []);
      generatedEqiiCode = eqiiCodeRes[0].next_eqii_code;
      
      const eqiiValues = [
        generatedEqiiCode,
        eqiiData.inst_date,
        eqiiData.chk_exp_date,
        eqiiData.stat,
        eqiiData.note,
        eqiiData.inst_emp_name || 'EMP-10001'
      ];
      
      eqiiResult = await mariadb.queryConn(conn, "insertEqii", eqiiValues);
    } else {
      // 기존 수정
      const eqiiValues = [
        eqiiData.inst_date,
        eqiiData.chk_exp_date,
        eqiiData.stat,
        eqiiData.note,
        eqiiData.inst_emp_name || 'EMP-10001',
        eqiiData.eqii_code
      ];
      
      eqiiResult = await mariadb.queryConn(conn, "updateEqii", eqiiValues);
    }
    
    let existingEqirs = [];
    if (eqiiData.eqii_code) {
      existingEqirs = await mariadb.queryConn(conn, "selectEqirCodesByEqiiCode", [generatedEqiiCode]);
    }
    
    const currentEqirCodes = eqirList
      .filter(item => item.eqir_code && item.eqir_code !== '')
      .map(item => item.eqir_code);
    
    const deletedEqirCodes = existingEqirs
      .map(item => item.eqir_code)
      .filter(code => !currentEqirCodes.includes(code));
    
    for (const deletedCode of deletedEqirCodes) {
      console.log('삭제될 항목:', deletedCode);
      
      await mariadb.queryConn(conn, "deleteEqMaByEqirCode", [deletedCode]);
      
      await mariadb.queryConn(conn, "deleteEqirByCode", [deletedCode]);
    }
    
    const eqirResults = [];
    
    for (const eqirData of eqirList) {
      if (eqirData.eqir_code && eqirData.eqir_code !== '') {
        const eqirValues = [
          eqirData.chk_start_date,
          eqirData.chk_end_date,
          eqirData.chk_detail,
          eqirData.chk_result,
          eqirData.eqi_stat,
          eqirData.note,
          eqirData.eqir_code
        ];
        
        const eqirResult = await mariadb.queryConn(conn, "updateEqir", eqirValues);
        eqirResults.push(eqirResult);
      } else {
        const eqirCodeRes = await mariadb.queryConn(conn, "selectEqirCodeForUpdate", []);
        const generatedEqirCode = eqirCodeRes[0].next_eqir_code;
        
        const eqirValues = [
          generatedEqirCode,
          generatedEqiiCode,
          eqirData.chk_start_date,
          eqirData.chk_end_date,
          eqirData.chk_detail,
          eqirData.chk_result,
          eqirData.eqi_stat,
          eqirData.note,
          eqirData.eq_name,
          eqirData.chk_text
        ];
        
        const eqirResult = await mariadb.queryConn(conn, "insertEqir", eqirValues);
        eqirResults.push(eqirResult);
      }
    }
    
    await conn.commit();
    
    return {
      result_code: "SUCCESS",
      eqii_code: generatedEqiiCode,
      eqii_result: eqiiResult,
      eqir_results: eqirResults,
      deleted_count: deletedEqirCodes.length
    };
    
  } catch (err) {
    await conn.rollback();
    console.log(err);
    throw err;
  } finally {
    conn.release();
  }
};

// 설비 수정 (점검주기도 함께)
const updateEq = async (eqCode, eqData) => {
  try {
    // 1단계: 설비 정보 수정
    const eqValues = [
      eqData.eq_name,
      eqData.eq_model,
      eqData.eq_maker,
      eqData.capacity,
      eqData.stat,
      eqData.eq_make_date,
      eqData.bring_date,
      eqData.take_date,
      eqData.eq_pos,
      eqData.eq_type,
      eqData.is_used,
      eqCode
    ];

    const eqResult = await mariadb.query("updateEq", eqValues);

    return eqResult;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteEq = async (eqCode) => {
  const result = await mariadb.query("deleteEq", [eqCode])
    .catch(err => console.log(err));
  return result;
};

const deleteEqii = async (eqiiCode) => {
  const conn = await mariadb.connectionPool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    await mariadb.queryConn(conn, "deleteEqMaByEqiiCode", [eqiiCode]);
    
    await mariadb.queryConn(conn, "deleteEqirByEqiiCode", [eqiiCode]);
    
    const result = await mariadb.queryConn(conn, "deleteEqiiByCode", [eqiiCode]);
    
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    console.log(err);
    throw err;
  } finally {
    conn.release();
  }
};

const selectEqiiStatus = async (eqiiCode) => {
  const result = await mariadb.query("selectEqiistatus", [eqiiCode])
    .catch(err => console.log(err));
  return result && result.length > 0 ? result[0].stat : null;
};

const deleteMultiple = async (eqCodes) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();

    const results = [];
    for (const eqCode of eqCodes) {
      const result = await mariadb.query("deleteEq", [eqCode])
        .catch(err => console.log(err));
      results.push(result);
    }
    await conn.commit();
    return results;
  }
  catch (err) {
    await conn.rollback();
    console.error('트랜잭션 실패:', err);
    throw err;
  }
  finally {
    conn.release();
  }
}

const findEqirMgList = async () => {
  const result = await mariadb.query("selectEqirMgList")
    .catch(err => console.log(err));
  return formatDatesInArray(result);
};

const findEqirMgListByCode = async (eqMaCode) => {
  const result = await mariadb.query("selectEqirMgListByCode", [eqMaCode])
    .catch(err => console.log(err));
  const formatted = result && result.length > 0 ? 
    formatDatesInObject(result[0]) : null;
  return formatted;
}

const updateEqMa = async (eqMaCode, eqMaData) => {
  const eqMaValues = [
    eqMaData.fail_date,
    eqMaData.fail_cause,
    eqMaData.act_detail,
    eqMaData.act_result,
    eqMaData.start_date,
    eqMaData.end_date,
    eqMaData.re_chk_exp_date,
    eqMaData.note,
    eqMaData.m_emp_name,
    eqMaData.fix_emp_name,
    eqMaCode  
  ];

  const result = await mariadb.query("updateEqMa", eqMaValues)
    .catch(err => console.log(err));
  return result;
};

// inserEqMa 함수 eq_ma_code 를 자동 생성하는 로직을 추가
const insertEqMa = async (eqMaData) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    await conn.beginTransaction();

    const eqMaCodeRes = await mariadb.queryConn(conn, "selectEqMaCodeForUpdate", []);
    const generatedCode = eqMaCodeRes[0].next_eq_ma_code;

    const eqMaValues = [
      generatedCode,
      eqMaData.fail_date,
      eqMaData.fail_cause,
      eqMaData.act_detail,
      eqMaData.act_result,
      eqMaData.start_date,
      eqMaData.end_date,
      eqMaData.re_chk_exp_date,
      eqMaData.note,
      eqMaData.eqir_code,
      eqMaData.m_emp_name,
      eqMaData.fix_emp_name
    ];

    const result = await mariadb.queryConn(conn, "insertEqMa", eqMaValues);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    console.log(err);
    throw err;
  } finally {
    conn.release();
  }
};

const deleteEqMa = async (eqMaCode) => {
  const result = await mariadb.query("deleteEqMa", [eqMaCode])
    .catch(err => console.log(err));
  return result;
};

const searchEqMa = async (params) => {
  const bindParams = [
    params.eq_ma_code, params.eq_ma_code,
    params.eq_name, params.eq_name,
    params.act_result, params.act_result,
    params.fail_cause, params.fail_cause,
    params.start_date, params.start_date,
    params.end_date, params.end_date,
    params.m_emp_name, params.m_emp_name,
    params.fix_emp_name, params.fix_emp_name
  ].map(param => param ?? null);

  try {
    const list = await mariadb.query("searchEqMa", bindParams);
    return formatDatesInArray(list);
  } catch (err) {
    console.error('설비 유지보수 검색 오류:', err);
    return [];
  }
};

module.exports = {
  findAll,
  searchEquipment,
  findByCode,
  insertEq,
  insertEqir,
  insertEqii,
  showEqir,
  updateEq,
  deleteEq,
  deleteMultiple,
  showEqii,
  showEqir,
  showEqiType,
  searchEqiType,
  selectEqiiStatus,
  findEqiiByCode,
  updateEqii,
  updateEqir,
  saveEqiiWithDetails,
  findEqiiByCode,
  updateEqir,
  deleteEqii,
  searchEqii,
  updateEqMa,
  insertEqMa,
  deleteEqMa,
  findEqirMgList,
  findEqirMgListByCode,
  simpleslectEqirList,
  searchEqMa,
  deleteEqMa
};