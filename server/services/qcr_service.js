// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");
const qcrsql = require("../database/sqls/qcr.js");

const { convertObjToAry } = require('../utils/converts.js');

// 목록 조회
const qcrList = async () => {
    const conn = await mariadb.connectionPool.getConnection();
      try {
        const result = await conn.query(qcrsql.qcrList);
        return result;
      } catch (err) {
        console.error('❌ 품질기준정보  목록 조회 실패:', err);
        throw err;
      } finally {
        conn.release();
      }
}

// 품질기준정보 검색 
const searchQcrList = async (params) => {
  let conn;
  try {
    conn = await mariadb.connectionPool.getConnection();
    const {
        qcr_code,
        inspection_item,
        com_value,
        regdate_from,
        regdate_to
    } = params;
        
    const result = await conn.query(qcrsql.searchQcrList, [
        qcr_code ?? null, qcr_code ?? null,
        inspection_item ?? null, inspection_item ?? null,
        com_value ?? null, com_value ?? null,
        regdate_from ?? null, regdate_to ?? null,
        regdate_from ?? null, regdate_to ?? null
    ]);

     return result   
    }catch (err) {
    console.error('❌ 품질기준정보 검색 목록 서비스 에러:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 품질 기준 단건 조회
const selectQcrOne = async (qcr_code) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    const [result] = await conn.query(qcrsql.selectQcrOne, [qcr_code]);
    return result; // 단건이므로 바로 반환
  } catch (err) {
    console.error("❌ 품질 기준 단건 조회 실패:", err);
    throw err;
  } finally {
    conn.release();
  }
};

// 품질기준정보 트랜잭션
const insertQcrTx = async (data) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    await conn.beginTransaction();

    // 품목유형에 따라 코드 자동 생성 쿼리 분기
    let codeRow;
    if (data.com_value === 'i1') {
      [codeRow] = await conn.query(qcrsql.selectQcrProdCodeForUpdate);
    } else {
      [codeRow] = await conn.query(qcrsql.selectQcrMatCodeForUpdate);
    }

    const newCode = codeRow.new_qcr_code;
    if (!newCode) throw new Error("❌ 품질기준코드 생성 실패");

    // 등록 쿼리 실행
    await conn.query(qcrsql.insertQcrs, [
      newCode,
      data.inspection_item,
      data.range_top,
      data.range_bot,
      data.unit,
      data.check_method,
      data.regdate,
      data.note,
      data.com_value
    ]);

    await conn.commit();
    return { success: true, qcr_code: newCode };

  } catch (err) {
    await conn.rollback();
    console.error("❌ 품질기준 등록 트랜잭션 실패:", err);
    throw err;
  } finally {
    conn.release();
  }
};



module.exports ={
    qcrList,
    searchQcrList,
    selectQcrOne,
    insertQcrTx
}