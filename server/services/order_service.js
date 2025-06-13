// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../utils/converts.js');

// 실제 제공할 서비스 등록 영역

// 조건 없이 전체조회
const findAllOrders = async () => {
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  const result = await mariadb.query("selectOrderList")
    .catch(err => console.log(err));
  return result;
};

// 특정 주문의 상세 정보 조회
const findOrderDetails = async (ordCode) => {
  // 주문 상세 테이블과 제품 테이블 JOIN해서 제품 정보까지 가져옴
  // 전달받은 ordCode는 WHERE 조건의 바인딩 값으로 들어감
  // SQL 쿼리에서 ?를 사용한 경우, 해당 ?에 들어갈 값을 배열로 넘겨야 정상 동작
  // 하나만 넘기더라도 배열로 감싸서 [ordCode] 형태로 전달해야 함
  // 만약, 이미 데이터가 배열로 구성되어 있으면 []로 감쌀 필요가 없음
  const result = await mariadb.query("selectOrderDetailList", [ordCode])
    .catch(err => console.log(err));
  return result;
};

// 거래처 목록 조회
const findClientList = async () => {
  // 거래처 테이블에서 전체 거래처 목록을 가져옴
  const result = await mariadb.query("selectClientList")
    .catch(err => console.log(err));
  return result;
};

// 제품 전체 조회
const findProductList = async () => {
  // 제품 테이블에서 모든 제품 정보 조회
  const result = await mariadb.query("selectProductList").catch(console.error);
  return result;
};

// 제품명으로 검색
const findProductByName = async (name) => {
  // 제품명에 특정 문자열이 포함된 제품들만 조회 (LIKE 검색)
  const result = await mariadb.query("selectProductByName", [name]).catch(console.error);
  return result;
};

// 공통코드 - 규격
const findSpecList = async () => {
  // group_value가 '0Z'인 공통코드만 가져와서 규격 옵션으로 사용
  const result = await mariadb.query("selectSpecCodes").catch(console.error);
  return result;
};

// 공통코드 - 단위
const findUnitList = async () => {
  // group_value가 '0H'인 공통코드만 가져와서 단위 옵션으로 사용
  const result = await mariadb.query("selectUnitCodes").catch(console.error);
  return result;
};

// 주문 등록
const insertOrder = async (orderData) => {
  // orderData는 ord_code부터 client_code까지 배열 형태로 전달됨
  const result = await mariadb.query("insertOrder", orderData)
    .catch(err => console.log(err));
  return result;
};

// 주문 상세(제품) 등록
const insertOrderDetail = async (detailData) => {
  // 제품별 상세 정보 등록
  const result = await mariadb.query("insertOrderDetail", detailData)
    .catch(err => console.log(err));
  return result;
};

/**
 * 주문 등록 with 트랜잭션
 * @param {Object} data
 * Object
 * {
 *   orderData: order_data,
 *   detailData: details
 * }
 */
const insertOrderTx = async (data) => {
  //Node.js가 MariaDB에 SQL을 실행하기 위해 열어놓는 통신 연결 통로
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction(); // 트랜잭션 BEGIN;

    // 주문 코드 새로 생성해 가져오기.
    const ordCodeRes = await mariadb.queryConn(conn, "selectOrdCodeForUpdate"); // 트랜잭션 발생 및 잠그기

    const ordCode = ordCodeRes[0].ord_code;

    // 주문 저장
    data.orderData.ord_code = ordCode;
    const result = await mariadb.queryConn(conn, "insertOrder", data.orderData); // 메인 등록: 주문서

    // 트랜잭션 내에서 실행
    for (const values of data.detailData) { // 주문서 상세
      values.ord_code = ordCode;
      await mariadb.queryConn(conn, "insertOrderDetail", values);
    }

    // 커밋 수행
    await conn.commit();

    return result;
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

// 주문 삭제 (트랜잭션으로 처리 권장)
const deleteOrderTx = async (ordCode) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    await conn.beginTransaction();
    await mariadb.queryConn(conn, "deleteOrderDetail", [ordCode]);
    await mariadb.queryConn(conn, "deleteOrder", [ordCode]);
    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    console.error("삭제 실패:", err);
    throw err;
  } finally {
    conn.release();
  }
};

module.exports ={
    // 해당 객체에 등록해야지 외부로 노출
    findAllOrders,
    findOrderDetails,
    findClientList,
    findProductList,
    findProductByName,
    findSpecList,
    findUnitList,
    insertOrder,
    insertOrderDetail,
    insertOrderTx,
    deleteOrderTx
};