// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require('../utils/converts.js');

// 실제 제공할 서비스 등록 영역

// 조건 없이 전체조회
const findAll = async () => {
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("selectOrderList")
    .catch(err => console.log(err));
  return list;
};

// 특정 주문의 상세 정보 조회
const findDetailByOrdCode = async (ordCode) => {
  // 주문 상세 테이블과 제품 테이블 JOIN해서 제품 정보까지 가져옴
  // 전달받은 ordCode는 WHERE 조건의 바인딩 값으로 들어감
  // SQL 쿼리에서 ?를 사용한 경우, 해당 ?에 들어갈 값을 배열로 넘겨야 정상 동작
  // 하나만 넘기더라도 배열로 감싸서 [ordCode] 형태로 전달해야 함
  // 만약, 이미 데이터가 배열로 구성되어 있으면 []로 감쌀 필요가 없음
  const detailList = await mariadb.query("selectOrderDetailList", [ordCode])
    .catch(err => console.log(err));
  return detailList;
};

// 주문 등록
const insertOrder = async (orderData) => {
  // 주문 기본 정보 등록용
  // orderData는 ord_code부터 client_code까지 배열 형태로 전달됨
  const result = await mariadb.query("insertOrder", orderData)
    .catch(err => console.log(err));
  return result;
};

// 주문 상세(제품) 등록
const insertOrderDetail = async (detailData) => {
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
 *   detailData: [
 *      ...detail_data,
 *   ]
 * }
 */
const insertOrderTx = async (data) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();

    // 주문 코드 새로 생성해 가져오기.
    const ordCodeRes = await mariadb.queryConn(conn, "selectOrdCodeForUpdate"); // 트랜잭션 발생 및 잠그기

    const ordCode = ordCodeRes[0].ord_code;

    // 주문 저장
    data.orderData.ord_code = ordCode;
    const result = await mariadb.queryConn(conn, "insertOrder", data.orderData);

    // 트랜잭션 내에서 실행
    for (const values of data.detailData) {
      values.ord_code = ordCode;
      await mariadb.queryConn(conn, "insertOrderDetail", detailData);
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

// 주문 삭제
const deleteOrder = async (ordCode) => {
  // 주문 테이블에서 ord_code 기준으로 삭제함
  // 외래키 제약 조건이 걸려 있기 때문에 주문 상세 삭제 이후에 수행해야 오류 안남
  const result = await mariadb.query("deleteOrder", [ordCode])
    .catch(err => console.log(err));
  return result;
};

// 주문 상세 삭제
const deleteOrderDetail = async (ordCode) => {
  // 주문 상세 테이블에서 ord_code 기준으로 전체 삭제함
  // deleteOrder 전에 실행해야 무결성 문제 없음
  const result = await mariadb.query("deleteOrderDetail", [ordCode])
    .catch(err => console.log(err));
  return result;
};

// 거래처 목록 조회
const findClientList = async () => {
  const result = await mariadb.query("selectClientList")
    .catch(err => console.log(err));
  return result;
};

module.exports ={
    // 해당 객체에 등록해야지 외부로 노출
    findAll,
    findDetailByOrdCode,
    insertOrder,
    insertOrderDetail,
    deleteOrder,
    deleteOrderDetail,
    findClientList,
    insertOrderTx
};