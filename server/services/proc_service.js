// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");
const procsql  = require('../database/sqls/proc.js');

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../utils/converts.js');


// 제품 목록 조회 완제품기준
const selectProdList = async () => {
  const list = await mariadb.query('selectProdList')
    .catch(err => {
      console.error('❌ 제품 목록 조회 실패:', err);
      return [];
    });
  return list;
};

// 제품공정흐름도 목록 조회
const getProcList = async() => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    const result = await conn.query(procsql.selectProcList);
    return result;
  } catch (err) {
    console.error('❌ 제품공정흐름도 목록 조회 실패:', err);
    throw err;
  } finally {
    conn.release();
  }
};

// 제품 공정흐름도 목록 검색
const searchProcList = async (search = {}) => {
  let conn;
  try {
    conn = await mariadb.connectionPool.getConnection();

    const {
      prod_proc_code,
      po_name,
      prod_code,
      prod_name,
      reg_date_from,
      reg_date_to
    } = search;

    const result = await conn.query(procsql.searchProcList, [
      prod_proc_code || null, prod_proc_code || null,
      po_name || null, po_name || null,
      prod_code || null, prod_code || null,
      prod_name || null, prod_name || null,
      reg_date_from || null, reg_date_from || null,
      reg_date_to || null, reg_date_to || null
    ]);

    return result;
  } catch (err) {
    console.error('❌ 제품공정흐름도 목록 조회 에러:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 제품공정 흐름도 상세 조회
const getProcFullOne = async (prod_proc_code) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {

    // 마스터 정보 조회
    const headerResult = await conn.query(procsql.procSelectOne, [prod_proc_code]);
    const header = headerResult[0]; // 단건이므로 첫 번째 요소

    // 상세 정보 조회
    const detailResult = await conn.query(procsql.procDSelectOne, [prod_proc_code]);

    // 결과 통합
    return {
      header,
      details: detailResult
    };
  } catch (err) {
    console.error('❌ 공정 흐름도 단건+상세 조회 에러:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 공정 목록 조회 팝업
const selectprocessListPopup = async () => {
  const list = await mariadb.query('processListPopup')  
    .catch(err => {
      console.error('❌ 공정 목록 조회 실패:', err);
      return [];
    });
  return list;
};

// 설비 유형 조회 팝업
const selecteqTypeListPopup = async () => {
  const list = await mariadb.query('eqTypeListPopup')  
    .catch(err => {
      console.error('❌ 공정 목록 조회 실패:', err);
      return [];
    });
  return list;
};


// 제품 공정 흐름도 등록 트랜잭션
const insertPorcDetailTx = async (data) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();

    const {
      procData,
      detailData
    } = data;

    // 제품 공정 흐름도 코드 생성
    const [procCodeRow] = await conn.query(procsql.selectProcCodeForUpdate);
    const proc_code = Object.values(procCodeRow)[0]; // 예: 'PROD-1002'


    // 제풍 공정 흐름도 등록
    await conn.query(procsql.insertProc, [
      proc_code,
      procData.po_name,
      procData.po_type,
      procData.reg_date,
      procData.note,
      procData.prod_code,
      procData.reg || 'EMP-10001'
    ]);

    const ppdCodes = [];
    // 흐름도 상세 등록
    for (const item of detailData) {
      // ✅ 상세 코드 매번 새로 생성
      const [procDCodeRow] = await conn.query(procsql.selectPpdCodeForUpdate);
      const ppd_code = Object.values(procDCodeRow)[0];
      ppdCodes.push(ppd_code); // ✅ 배열에 저장

      await conn.query(procsql.insertProcDetail, [
        ppd_code,
        item.no,
        proc_code,             // 상위 공정코드
        item.po_code,
        item.eq_type,
      ]);
    }

    await conn.commit();
    return { success: true, proc_code, ppd_codes: ppdCodes };

  } catch (err) {
    await conn.rollback();
    console.error('❌ 트랜잭션 실패:', err);
    throw err;
  } finally {
    conn.release();
  }
};


module.exports ={
  selectProdList,
  getProcList,
  searchProcList,
  getProcFullOne,
  selectprocessListPopup,
  selecteqTypeListPopup,
  insertPorcDetailTx
  
}