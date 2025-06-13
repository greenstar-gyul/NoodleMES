const mariadb = require("../database/mapper.js");
const { convertObjToAry } = require('../utils/converts.js');

/**
 * 조건 없이 mrp 전체조회
 * @returns 전체 MRP 리스트
 */
const findAll = async () => {
  const list = await mariadb.query("selectMRPList")
    .catch(err => console.log(err));
  return list;
};

/**
 * 조건 없이 mrp 상세 전체조회
 * @returns MRP 상세 전체 리스트
 */
const findDetailsAll = async () => {
  const list = await mariadb.query("selectMRPDetailList")
    .catch(err => console.log(err));
  return list;
};

/**
 * 생산 계획 전체 조회
 * @returns 생산 계획 리스트
 */
const findPlansAll = async () => {
  const list = await mariadb.query("selectPRDPList")
    .catch(err => console.log(err));
  return list;
};

/** 
 * 특정 생산 계획의 mrp 코드 조회
 *  @returns 특정 생산 계획의 mrp 코드
 * */
const findMRPCode = async (prdpCode) => {
  const list = await mariadb.query("selectMRPCode", prdpCode)
    .catch(err => console.log(err));
  return list;
};

/** 
 * 특정 mrp 코드의 mrp 조회
 *  @returns 특정 mrp 코드의 mrp
 * */
const findMRP = async (mrpCode) => {
  const mrp = await mariadb.query("selectMRP", mrpCode)
    .catch(err => console.log(err));
  return mrp;
};

/** 
 * 특정 mrp 코드의 mrp 상세 조회
 *  @returns 특정 mrp 코드의 mrp 상세
 * */
const findMRPDetail = async (mrpCode) => {
  const list = await mariadb.query("selectMRPDetail", mrpCode)
    .catch(err => console.log(err));
  return list;
};

/**
 * BOM에 따른 하위 자재들 조회(생산계획코드 활용)
 */
const findMatByBom = async (prdpCode) => {
  const list = await mariadb.query('selectBOMbyprdpcode', prdpCode)
    .catch(err => console.log(err));
  return list;
};

/**
 * MRP 등록 with 트랜잭션
 * @param {Object} data
 * Object
 * {
 *   mrpData: mrp_data,
 *   detailData: details
 * }
 */
const insertMRPTx = async (data) => {
  //Node.js가 MariaDB에 SQL을 실행하기 위해 열어놓는 통신 연결 통로
  const conn = await mariadb.connectionPool.getConnection();

  // 트랜잭션 내에서 실행
  try {
    await conn.beginTransaction(); // 트랜잭션 BEGIN;

    // MRP 코드 새로 생성해 가져오기
    const mrpCodeRes = await mariadb.queryConn(conn, "selectMRPCodeForUpdate"); // 트랜잭션 발생 및 잠그기
    const mrpCode = mrpCodeRes[0].mrp_code;

    // MRP 코드 저장
    data.mrpData.mrp_code = mrpCode;
    // console.log(mrpCode);

    const mrpData = convertObjToAry(data.mrpData, ['mrp_code', 'prdp_date', 'start_date', 'note', 'prdp_code', 'emp_code']);
    const result = await mariadb.queryConn(conn, "insertMRP", mrpData); // MRP 등록
    
    // MRP 상세
    for (const values of data.detailData) {
      const mrpDCodeRes = await mariadb.queryConn(conn, "selectMRPDetailCode"); // MRP 상세 코드 가져오기
      const mrpDCode = mrpDCodeRes[0].mrp_d_code;
      values.mrp_d_code = mrpDCode;
      
      const mrpData = convertObjToAry(values, ['mrp_d_code', 'unit', 'req_qtt', 'mrp_code', 'mat_code']);
      await mariadb.queryConn(conn, "insertMRPDetail", mrpData); // MRP 상세 등록
    }

    // 커밋 수행
    await conn.commit();

    return result;
  }
  catch (err) {
    await conn.rollback(); // 트랜잭션 실패 시 롤백 후 오류 알림
    console.error('트랜잭션 실패:', err);

    throw err;
  }
  finally {
    conn.release(); // 컨넥션 풀 반납
  }
};

/**
 * MRP 수정 with 트랜잭션
 * @param {Object} data
 * Object
 * {
 *   mrpData: mrp_data,
 *   detailData: details
 * }
 */
const modifyMRPTx = async (data) => {
  //Node.js가 MariaDB에 SQL을 실행하기 위해 열어놓는 통신 연결 통로
  const conn = await mariadb.connectionPool.getConnection();

  // 트랜잭션 내에서 실행
  try {
    await conn.beginTransaction(); // 트랜잭션 BEGIN;

    // MRP 코드 새로 생성해 가져오기
    const mrpCodeRes = await mariadb.queryConn(conn, "selectMRPCodeForUpdate"); // 트랜잭션 발생 및 잠그기
    const mrpCode = mrpCodeRes[0].mrp_code;

    // MRP 코드 저장
    data.mrpData.mrp_code = mrpCode;
    const result = await mariadb.queryConn(conn, "insertMRP", data.mrpData); // MRP 등록

    // MRP 상세
    for (const values of data.detailData) {
      const mrpDCodeRes = await mariadb.queryConn(conn, "selectMRPDetailCode"); // MRP 상세 코드 가져오기
      const mrpDCode = mrpDCodeRes[0].mrp_d_code;
      values.mrp_d_code = mrpDCode;

      await mariadb.queryConn(conn, "insertMRPDetail", values); // MRP 상세 등록
    }

    // 커밋 수행
    await conn.commit();

    return result;
  }
  catch (err) {
    await conn.rollback(); // 트랜잭션 실패 시 롤백 후 오류 알림
    console.error('트랜잭션 실패:', err);

    throw err;
  }
  finally {
    conn.release(); // 컨넥션 풀 반납
  }
};

/**
 * 데이터 코드로 변환 : 코드명 -> 코드값
 * 
 * @param {String} label
 * 변환할 값
 * @param {String} group 
 * 값의 그룹
 * @returns 
 */
const convertLabelToCode = (label, group) => {
    
}

module.exports = {
  findAll,
  findDetailsAll,
  findPlansAll,
  findMRPCode,
  findMRPDetail,
  findMRP,
  insertMRPTx,
  findMatByBom,
  modifyMRPTx,
};