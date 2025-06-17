// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");
const linesql  = require('../database/sqls/line.js');

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../utils/converts.js');

// 목록 조회
const getLineList = async () => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    const result = await conn.query(linesql.selectLineList);
    return result;
  } catch (err) {
    console.error('❌ Line 목록 조회 실패:', err);
    throw err;
  } finally {
    conn.release();
  }
};

// 🔍 라인 검색 서비스
const searchLineList = async (params) => {
  let conn;
  try {
    conn = await mariadb.connectionPool.getConnection();

    const {
      line_code,
      line_name,
      line_type,
      is_used,
      regdate_t_from,
      regdate_t_to
    } = params;

    const result = await conn.query(linesql.searchLineList, [
      line_code ?? null, line_code ?? null,
      line_name ?? null, line_name ?? null,
      line_type ?? null, line_type ?? null,
      is_used ?? null, is_used ?? null,
      regdate_t_from ?? null, regdate_t_to ?? null, regdate_t_from ?? null, regdate_t_to ?? null
    ]);

    return result;
  } catch (err) {
    console.error('❌ Line 검색 목록 서비스 에러:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 공정흐름리스트 팝업
const getProcessListPopup = async () => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    const result = await conn.query(linesql.processPopup);
    return result;
  } catch (err) {
    console.error('❌ 공정 흐름 팝업 목록 조회 실패:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 설비 리스트 팝업
const getFacilitieListPopup = async () => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    const result = await conn.query(linesql.facilitieListPopup);
    return result;
  } catch (err) {
    console.error('설비목록 팝업 목록 조회 실패:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 라인등록 트랜잭션
const insertLineAndLineD = async (data) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();

    const { lineData, lineDetailData } = data;

    // ✅ 1. 라인코드 자동 생성
    const [lineCodeRow] = await conn.query(linesql.selectLineCodeForUpdate);
    const line_code = Object.values(lineCodeRow)[0]; // 예: 'LINE-001'

    // ✅ 2. 라인 등록
    await conn.query(linesql.insertLine, [
      line_code,
      lineData.line_name,
      lineData.line_type,
      lineData.mdept_code,
      lineData.regdate_t,
      lineData.is_used,
      lineData.note || '',
    ]);

    // ✅ 3. 라인 상세 등록 (반복문 안에서 line_eq_code 생성)
    for (const detail of lineDetailData) {
      const [lineDCodeRow] = await conn.query(linesql.selectLECodeForUpdate);
      const line_eq_code = Object.values(lineDCodeRow)[0]; // 예: 'LE-0001', 'LE-0002' 등

      await conn.query(linesql.insertLineDetail, [
        line_eq_code,
        detail.pp_code,  // 🔍 반드시 포함되어야 함!
        line_code,
        detail.eq_code,
      ]);
    }

    await conn.commit();
    return { success: true, line_code };

  } catch (err) {
    await conn.rollback();
    console.error('❌ 트랜잭션 실패:', err);
    throw err;
  } finally {
    conn.release();
  }
};

// 셀렉트 박스 클릭시 단건조회
const findLineOne = async (line_code) => {
  try {
    const [lineData] = await mariadb.query("selectLineOne", [line_code]);
    const lineDetailData = await mariadb.query("selectLineDetail", [line_code]);

    return { lineData, lineDetailData };
  } catch (err) {
    console.error('❌ 라인 단건조회 에러:', err);
    throw err;
  }
};

// 제품 목록 조회
const selectProdList = async () => {
  const list = await mariadb.query('selectProdList')
                            .catch(err => {
                              console.error('❌ 제품 목록 조회 실패:', err);
                              return [];
                            });
  return list;
};

// 제품 선택 시 해당 제품의 공정 흐름도 상세 목록 조회
const getProdProcessDetail = async (prod_code) => {
  let conn;
  try {
    conn = await mariadb.connectionPool.getConnection();
    
    const result = await conn.query(linesql.selectProdDetail, [prod_code]);
    return result;  // 여러 행이므로 그대로 리턴
  } catch (err) {
    console.error('❌ 제품 공정 흐름도 상세 조회 에러:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports ={
    getLineList,
    searchLineList,
    getProcessListPopup,
    getFacilitieListPopup,
    insertLineAndLineD,
    findLineOne,
    selectProdList,
    getProdProcessDetail
};