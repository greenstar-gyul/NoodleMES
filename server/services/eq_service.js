const mariadb = require("../database/mapper.js");
const eqQueries = require('../database/sqls/eq.js');
const { convertObjToAry } = require('../utils/converts.js');

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
  return list;
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
  return result && result.length > 0 ? result[0] : null;
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
    
    // 1️⃣ 지시서 처리 (기존과 동일)
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
    
    // 2️⃣ 🔥 기존 점검항목 조회 (삭제된 항목 찾기 위해)
    let existingEqirs = [];
    if (eqiiData.eqii_code) {
      existingEqirs = await mariadb.queryConn(conn, "selectEqirCodesByEqiiCode", [generatedEqiiCode]);
    }
    
    // 3️⃣ 🔥 삭제된 항목 처리
    const currentEqirCodes = eqirList
      .filter(item => item.eqir_code && item.eqir_code !== '')
      .map(item => item.eqir_code);
    
    const deletedEqirCodes = existingEqirs
      .map(item => item.eqir_code)
      .filter(code => !currentEqirCodes.includes(code));
    
    // 🔥 삭제된 항목들 처리
    for (const deletedCode of deletedEqirCodes) {
      console.log('🗑️ 삭제될 항목:', deletedCode);
      
      // eq_ma_tbl에서 먼저 삭제
      await mariadb.queryConn(conn, "deleteEqMaByEqirCode", [deletedCode]);
      
      // eqir_tbl에서 삭제
      await mariadb.queryConn(conn, "deleteEqirByCode", [deletedCode]);
    }
    
    // 4️⃣ 점검항목 처리 (업데이트/추가)
    const eqirResults = [];
    
    for (const eqirData of eqirList) {
      if (eqirData.eqir_code && eqirData.eqir_code !== '') {
        // 🔄 기존 점검항목 업데이트
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
        // 🆕 새 점검항목 추가
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
      deleted_count: deletedEqirCodes.length  // 🔥 삭제 개수 추가
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
    
    // 1️⃣ 먼저 관련 점검항목들 삭제 (외래키 때문에)
    // eq_ma_tbl에서 참조하는 데이터가 있으면 먼저 삭제
    await mariadb.queryConn(conn, "deleteEqMaByEqiiCode", [eqiiCode]);
    
    // 2️⃣ 점검항목 삭제
    await mariadb.queryConn(conn, "deleteEqirByEqiiCode", [eqiiCode]);
    
    // 3️⃣ 지시서 삭제
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
  deleteEqii
};