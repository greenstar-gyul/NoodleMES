// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");
const bomSql  = require('../database/sqls/bom.js');

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../utils/converts.js');

// 제품등록 트랜잭션
const insertProductAndBomTx = async (data) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();

    const {
      productData,
      bomData,
      detailData
    } = data;

    // ✅ 1. 제품코드 자동 생성
    const [prodCodeRow] = await conn.query(bomSql.selectProdCodeForUpdate);
    const prod_code = Object.values(prodCodeRow)[0]; // 예: 'PROD-1002'

    // ✅ 2. BOM코드 자동 생성 (제품코드 기반)
    const bom_code = `BOM-${prod_code}`; // 예: 'BOM-PROD-1002'

    // ✅ 3. prod_type이 올바른 값인지 확인
    console.log('🔍 원본 productData.prod_type:', productData.prod_type);

    // ✅ 4. 타입 문자열이면 변환
    const typeMap = {
      '완제품': 'i1',
      '반제품': 'i2'
    };
    const normalizedProdType = typeMap[productData.prod_type] || productData.prod_type;

    console.log('✅ 변환된 prod_type:', normalizedProdType);

    // ✅ 5. 제품 등록
    await conn.query(bomSql.insertProduct, [
      prod_code,
      productData.prod_name,
      normalizedProdType,
      productData.unit,
      productData.spec,
      productData.is_used,
      productData.edate,
      productData.regdate,
      productData.note || '',
      productData.com_value,
      productData.reg || 'EMP-10001'
    ]);

    // ✅ 6. BOM 등록
    await conn.query(bomSql.insertBom, [
      bom_code,
      bomData.unit,
      bomData.spec,
      bomData.regdate,
      bomData.udate,
      prod_code,
      bomData.is_used
    ]);

    // ✅ 7. BOM 자재 구성 등록
    // ✅ 7. BOM 자재 구성 등록
    for (const item of detailData) {
      // 🔄 타입 매핑
      const typeMap = {
        '반제품': 'i2'
      };

      const mat_type_code = typeMap[item.mat_type] || item.mat_type; // 코드로 변환

      console.log(`🔧 변환된 자재 타입: ${item.mat_type} → ${mat_type_code}`);

      await conn.query(bomSql.insertBomMat, [
        bom_code,
        item.mat_code,
        item.mat_name,
        mat_type_code, // 변환된 코드로 저장
        item.req_qtt,
        item.unit,
        item.loss_rate
      ]);
    }

    await conn.commit();
    return { success: true, prod_code, bom_code };

  } catch (err) {
    await conn.rollback();
    console.error('❌ 트랜잭션 실패:', err);
    throw err;
  } finally {
    conn.release();
  }
};


// 목록 조회
const getBomList = async () => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    const result = await conn.query(bomSql.selectBomList);
    return result;
  } catch (err) {
    console.error('❌ BOM 목록 조회 실패:', err);
    throw err;
  } finally {
    conn.release();
  }
};

// 🔍 BOM 상세 조회 (제품 + BOM 헤더 + 자재 상세)
const findOneBomDetail = async (bom_code) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    const [header] = await conn.query(bomSql.prodSelectOne, [bom_code]);
    const details = await conn.query(bomSql.matSelectDetail, [bom_code]);

    return {
      product: header,
      materials: details
    };
  } catch (err) {
    console.error('❌ BOM 상세 조회 에러:', err);
    throw err;
  } finally {
    conn.release();
  }
};

// 자재 + 반제품 목록 조회 (팝업용)
const getMaterialsForPopup = async () => {
  let conn;
  try {
    conn = await mariadb.connectionPool.getConnection();
    const result = await conn.query(bomSql.selectAllMaterialsForPopup);
    return result;
  } catch (err) {
    console.error('❌ 자재 팝업 조회 실패:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


// 🔍 BOM 검색 서비스
const searchBomList = async (params) => {
  let conn;
  try {
    conn = await mariadb.connectionPool.getConnection();

    const {
      bom_code,
      prod_code,
      prod_name,
      com_value,
      regdate_from,
      regdate_to
    } = params;

    const result = await conn.query(bomSql.searchBomList, [
      bom_code ?? null, bom_code ?? null,
      prod_code ?? null, prod_code ?? null,
      prod_name ?? null, prod_name ?? null,
      com_value ?? null, com_value ?? null,
      regdate_from ?? null, regdate_to ?? null,
      regdate_from ?? null, regdate_to ?? null
    ]);

    return result;
  } catch (err) {
    console.error('❌ BOM 검색 목록 서비스 에러:', err);
    throw err;
  } finally {
     conn.release();
  }
};

// 제품 유형 불러오기 
const getComValueOptions = async () => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    const result = await conn.query(bomSql.selectComValueOptions); 
    return result;  // ✅ 이제는 { com_value, com_name } 형태의 객체 배열이므로 그대로 리턴
  } catch (err) {
    console.error('❌ 제품유형 목록 조회 실패:', err);
    throw err;
  } finally {
    conn.release();
  }
};

module.exports ={
    insertProductAndBomTx,
    getBomList,
    findOneBomDetail,
    getMaterialsForPopup,
    searchBomList,
    getComValueOptions
};