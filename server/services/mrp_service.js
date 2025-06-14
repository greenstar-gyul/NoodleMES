const mariadb = require("../database/mapper.js");
const { convertObjToAry } = require('../utils/converts.js');

const codeMapper = {
  '단위': '0H',
  '0H': {
    'kg': 'h1',
    't': 'h2',
    'L': 'h3',
    'ea': 'h4',
    'box': 'h5',
    'g': 'h6',
    'mm': 'h7',
    '%': 'h8',
    'cm': 'h9',
    'N': 'ha',
  }
}

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
    // console.log('아아앙아아악!!!!!!!!', data.mrpData);
    
    const mrpData = convertObjToAry(data.mrpData, ['mrp_code', 'prdp_date', 'start_date', 'note', 'prdp_code', 'emp_code']);
    const result = await mariadb.queryConn(conn, "insertMRP", mrpData); // MRP 등록
    
    // MRP 상세
    for (const values of data.detailData) {
      const mrpDCodeRes = await mariadb.queryConn(conn, "selectMRPDetailCode"); // MRP 상세 코드 가져오기
      const mrpDCode = mrpDCodeRes[0].mrp_d_code;
      values.mrp_d_code = mrpDCode;
      values.mrp_code = mrpCode;
      values.unit = convertLabelToCode(values.unit, '단위');
      
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

    const mrpCode = data.mrpData.mrp_code;
    const result = await mariadb.queryConn(conn, "updateMRP", [ data.mrpData.note, data.mrpData.mrp_code ]); // MRP 등록
    
    // MRP 상세
    for (const values of data.detailData) {
      // 이미 저장된 상세 정보인지?
      // 이미 저장된 상세 정보면 갱신만
      let mrpDCodeChk = values.mrp_d_code;
      if (mrpDCodeChk) {
        await mariadb.queryConn(conn, "updateMRPDetail", [ values.req_qtt, values.mrp_d_code ]); // MRP 상세 수정
      }
      // 없는 정보면 신규 등록
      else {
        const mrpDCodeRes = await mariadb.queryConn(conn, "selectMRPDetailCode"); // MRP 상세 코드 가져오기
        const mrpDCode = mrpDCodeRes[0].mrp_d_code;
        values.mrp_d_code = mrpDCode;
        values.mrp_code = mrpCode;
        values.unit = convertLabelToCode(values.unit, '단위');

        const mrpData = convertObjToAry(values, ['mrp_d_code', 'unit', 'req_qtt', 'mrp_code', 'mat_code']);
        await mariadb.queryConn(conn, "insertMRPDetail", mrpData); // MRP 상세 등록
      }
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
 * BOM에 따른 하위 자재들 조회(생산계획코드 활용)
 */
const getMatList = async () => {
  // console.log('서비ㅣㅣㅣㅣㅣ스ㅡㅡㅡㅡㅡㅡ');
  const list = await mariadb.query('selectMatAlll')
    .catch(err => console.log(err));
  return list;
};

/**
 * 여러 검색 조건들로 MRP 조회하기
 * @param {*} params 검색조건
 * @returns MRP List
 */
const searchMRPByOptions = async (params) => {
  // null이나 undefined도 체크해서 null로 맞춰주기
  const bindParams = [
    params.mrp_code ?? null, params.mrp_code ?? null,
    params.prdp_code ?? null, params.prdp_code ?? null,
    params.prdp_name ?? null, params.prdp_name ?? null,
    params.mat_name ?? null, params.mat_name ?? null,
    params.plan_date_from ?? null, params.plan_date_from ?? null,
    params.plan_date_to ?? null, params.plan_date_to ?? null
  ];

  const list = await mariadb.query("selectMRPByOptions", bindParams)
                            .catch(err => console.log(err));
  return list;
};

/**
 * 최근 1달 MRP 조회
 * @returns 최근 1달 MRP List
 */
const searchMRPMonth = async () => {
  let list = await mariadb.query("selectMRPMonth")
                          .catch(err => console.log(err));
  return list;
}

/**
 * 데이터 코드로 변환 : 코드명 -> 코드값
 * 
 * @param {String} label
 * 변환할 값
 * @param {String} group 
 * 값의 그룹 이름(예, 단위), null이면 그룹 코드
 * @returns 
 */
const convertLabelToCode = (label, group = null) => {
    if (group == null) {
      return codeMapper[label];
    }

    let groupCode = codeMapper[group];
    return codeMapper[groupCode][label];
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
  getMatList,
  searchMRPByOptions,
  searchMRPMonth,
};