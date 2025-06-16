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
  },
  '작업상태': '0V',
  '0V': {
    '대기': 'v4',
    '진행중': 'v1',
    '완료': 'v2',
    '중단': 'v3',
  }
}

/**
 * 조건 없이 작업지시서 전체조회
 */
const findAll = async () => {
  const list = await mariadb.query("selectWKOList")
    .catch(err => console.log(err));
  return list;
};

/**
 * 생산 계획 전체 조회
 */
const findPlansAll = async () => {
  const list = await mariadb.query("selectPRDPList")
    .catch(err => console.log(err));
  return list;
};

/** 
 * 특정 작업지시서 코드의 작업지시서 조회
 */
const findWKO = async (wkoCode) => {
  const wko = await mariadb.query("selectWKO", wkoCode)
    .catch(err => console.log(err));
  return wko;
};

/** 
 * 작업지시서의 공정 목록 조회
 */
const findWKOProcesses = async (lineCode) => {
  const list = await mariadb.query("selectWKOProcesses", [lineCode])
    .catch(err => console.log(err));
  console.log('아오!!!!!!!!!!!!', list);
  return list;
};

/**
 * 제품별 생산공정 조회 (참조용)
 */
const findProdProcesses = async (prodCode) => {
  const list = await mariadb.query('selectProdProcesses', [prodCode])
    .catch(err => console.log(err));
  return list;
};

/**
 * 작업자 목록 조회
 */
const findEmpList = async (empName) => {
  const list = await mariadb.query('selectEMPList', [empName, empName, empName])
    .catch(err => console.log(err));
  return list;
};

/**
 * 제품의 라인 목록 조회
 */
const findLineList = async (values) => {
  const prodCode = values[0];
  const lineName = values[1];
  const list = await mariadb.query('selectLineList', [prodCode, prodCode, lineName, lineName, lineName])
    .catch(err => console.log(err));
  return list;
};

/**
 * 작업지시서 등록 with 트랜잭션
 */
const insertWKOTx = async (data) => {
  const conn = await mariadb.connectionPool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // 작업지시서 코드 생성
    const wkoCodeRes = await mariadb.queryConn(conn, "selectWKOCodeForUpdate");
    const wkoCode = wkoCodeRes[0].wko_code;
    
    // 코드 변환
    // const stat = convertLabelToCode(data.stat, '작업상태');
    
    const wkoData = [
      wkoCode,
      data.note || null,
      data.prdp_code || null,
      data.prod_code,
      data.emp_code || null,
      data.wko_qtt,
      data.reg_code,
      data.line_code,
    ];
    
    const result = await mariadb.queryConn(conn, "insertWKO", wkoData);
    
    await conn.commit();
    return { wko_code: wkoCode, ...result };
  }
  catch (err) {
    await conn.rollback();
    console.error('트랜잭션 실패:', err);
    throw err;
  }
  finally {
    conn.release();
  }
};

/**
 * 작업지시서 수정
 */
const modifyWKO = async (wkoCode, data) => {
  // 코드 변환
  // const prodType = convertLabelToCode(data.prod_type, '제품타입');
  // const stat = convertLabelToCode(data.stat, '작업상태');
  
  const updateData = [
    data.note,
    data.wko_qtt,
    wkoCode
  ];
  
  const result = await mariadb.query("updateWKO", updateData)
    .catch(err => console.log(err));
  return result;
};

/**
 * 작업지시서 삭제
 */
const deleteWKO = async (wkoCode) => {
  const result = await mariadb.query("deleteWKO", [wkoCode])
    .catch(err => console.log(err));
  return result;
};

/**
 * 생산 계획에 따른 제품 목록 조회
 */
const getProdList = async (prdpCode) => {
  const list = await mariadb.query('selectProdListForWKO', [prdpCode, prdpCode, prdpCode])
    .catch(err => console.log(err));
  
  for (let i = 0; i < list.length; i++) {
    list[i].prod_id = i + 1;
  }
  return list;
};

/**
 * 전체 제품 목록 조회
 */
const getProdAll = async () => {
  const list = await mariadb.query('selectProdAll')
    .catch(err => console.log(err));
  
  for (let i = 0; i < list.length; i++) {
    list[i].prod_id = i + 1;
  }
  return list;
};

/**
 * 생산 계획에 따른 제품 목록 검색
 */
const getProdSearchByPrdp = async (values) => {
  const list = await mariadb.query('selectProdListForWKOByName', values)
    .catch(err => console.log(err));
  
  for (let i = 0; i < list.length; i++) {
    list[i].prod_id = i + 1;
  }
  return list;
};

/**
 * 생산 계획에 따른 제품 목록 검색
 */
const getProdSearch = async (values) => {
  const list = await mariadb.query('selectProdAllForWKOByName', values)
    .catch(err => console.log(err));
  
  console.log('아니 개빡치네:', values);

  for (let i = 0; i < list.length; i++) {
    list[i].prod_id = i + 1;
  }
  return list;
};

/**
 * 여러 검색 조건들로 작업지시서 조회하기
 */
const searchWKOByOptions = async (params) => {
  // 디버깅용 로그
  console.log('검색 파라미터 수신:', params);
  
  // 빈 문자열을 null로 변환
  const cleanParams = {
    wko_code: params.wko_code || null,
    prdp_code: params.prdp_code || null, 
    prdp_name: params.prdp_name || null,
    prod_name: params.prod_name || null,
    reg_date_from: params.reg_date_from || null,
    reg_date_to: params.reg_date_to || null
  };
  
  const bindParams = [
    cleanParams.wko_code, cleanParams.wko_code, cleanParams.wko_code,
    cleanParams.prdp_code, cleanParams.prdp_code, cleanParams.prdp_code,
    cleanParams.prdp_name, cleanParams.prdp_name, cleanParams.prdp_name,
    cleanParams.prod_name, cleanParams.prod_name, cleanParams.prod_name,
    cleanParams.reg_date_from, cleanParams.reg_date_from,
    cleanParams.reg_date_to, cleanParams.reg_date_to
  ];

  console.log('바인딩 파라미터:', bindParams); // 디버깅용

  const list = await mariadb.query("selectWKOByOptions", bindParams)
                            .catch(err => console.log(err));
  
  console.log('조회 결과 건수:', list?.length || 0); // 디버깅용
  
  return list;
};

/**
 * 최근 1달 작업지시서 조회
 */
const searchWKOMonth = async () => {
  let list = await mariadb.query("selectWKOMonth")
                          .catch(err => console.log(err));
  return list;
}

/**
 * 데이터 코드로 변환 : 코드명 -> 코드값(미사용)
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
  findPlansAll,
  findWKO,
  findWKOProcesses,
  findProdProcesses,
  insertWKOTx,
  modifyWKO,
  deleteWKO,
  getProdList,
  searchWKOByOptions,
  searchWKOMonth,
  findEmpList,
  getProdAll,
  getProdSearchByPrdp,
  getProdSearch,
  findLineList,
};