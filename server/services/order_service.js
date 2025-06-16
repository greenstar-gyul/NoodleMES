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

// 날짜 조건을 반영한 주문 조회
const findOrdersWithDate = async (fromDate, toDate) => {
  try {
    const result = await mariadb.query("selectOrderListWithDate", [fromDate, toDate]);
    return result;
  } catch (err) {
    console.error("날짜 조건 주문 조회 실패:", err);
    throw err;
  }
};

// 검색조건에 맞는 주문 조회
const findOrdersByCondition = async (conditions) => {
  const {ord_date_from, ord_date_to, ord_code, ord_name, client_name, ord_stat, prod_qtt_from, prod_qtt_to, delivery_date_from, delivery_date_to} = conditions;

  // 2번씩 값을 넣는 이유는, SQL문에서 같은 조건에 대해 ?가 두 번 사용되기 때문
  // 예: (? IS NULL OR ord_code LIKE CONCAT('%', ?, '%')) ← ?가 2개!
  // 각각의 ? 자리에는 동일한 값이 들어가야 하므로, 배열에 같은 값을 두 번 넣음
  // Node.js의 mariadb.query(sql, values)는 SQL에 등장하는 ?의 순서에 따라 배열 값을 차례대로 매핑하므로
  // SQL문에 ?가 12개라면, values도 정확히 12개의 값이 있어야 함
  // => 따라서 ord_date_from, ord_date_to 등은 두 번씩 values에 포함됨

  const clean = (v) => {
    if (v === '' || v === undefined || v === null) return null;
    if (typeof v === 'string' && v.trim() === '') return null;
    return v;
  };

  const values = [
    clean(ord_date_from), clean(ord_date_from),
    clean(ord_date_to), clean(ord_date_to),
    clean(ord_code), clean(ord_code),
    clean(ord_name), clean(ord_name),
    clean(client_name), clean(client_name),
    clean(ord_stat), clean(ord_stat),
    clean(prod_qtt_from), clean(prod_qtt_from),
    clean(prod_qtt_to), clean(prod_qtt_to),
    clean(delivery_date_from), clean(delivery_date_from),
    clean(delivery_date_to), clean(delivery_date_to)
  ];

  try {
    const result = await mariadb.query("selectOrderListByCondition", values);
    console.log("🧪 검색 조건 값 확인:", values);
    return result;
  } catch (err) {
    console.error("조건 주문 조회 실패:", err);
    throw err;
  }
};



// 거래처 목록 조회
const findClientList = async () => {
  // 거래처 테이블에서 전체 거래처 목록을 가져옴
  const result = await mariadb.query("selectClientList")
    .catch(err => console.log(err));
  return result;
};

// 주문 상태 목록 조회
const findOrderStatuses = async () => {
  // 주문 상태 코드 그룹에서 주문 상태 목록을 가져옴
  const result = await mariadb.query("selectOrderStatuses")
    .catch(err => console.log(err));
  return result;
};

// 제품 전체 조회
const findProductList = async () => {
  // 제품 테이블에서 모든 제품 정보 조회
  const result = await mariadb.query("selectProductList")
    .catch(err => console.log(err));
  return result;
};

// 제품명으로 검색
const findProductByName = async (name) => {
  // 제품명에 특정 문자열이 포함된 제품들만 조회 (LIKE 검색)
  const result = await mariadb.query("selectProductByName", [name])
    .catch(err => console.log(err));
  return result;
};

// 출고 요청 전체 조회
const selectReleaseList = async () => {
  const result = await mariadb.query("selectReleaseList").catch(err => console.log(err));
  return result;
};

//출고 요청 등록
const insertReleaseTx = async (data) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();

    // 출고요청 코드 생성
    const codeRes = await mariadb.queryConn(conn, "selectOutReqCodeForUpdate");
    const outReqCode = codeRes[0].out_req_code;

    data.releaseData.out_req_code = outReqCode;

    const headerCols = ['out_req_code', 'out_req_date', 'ord_predict_date', 'note', 'ord_code', 'mcode', 'client_code'];
    const detailCols = ['out_req_d_code', 'out_req_d_amount', 'prod_type', 'ord_amount', 'out_req_code', 'prod_code'];

    // 출고요청 헤더 insert
    await mariadb.queryConn(conn, "insertOutReq", convertObjToAry(data.releaseData, headerCols));

    // 출고요청 상세 insert
    for (const row of data.detailData) {
      const detailCodeRes = await mariadb.queryConn(conn, "selectOutReqDCodeForUpdate");
      const outReqDCode = detailCodeRes[0].out_req_d_code;

      row.out_req_code = outReqCode;
      row.out_req_d_code = outReqDCode;

      await mariadb.queryConn(conn, "insertOutReqDetail", convertObjToAry(row, detailCols));
    }

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    console.error("출고요청 등록 실패:", err);
    throw err;
  } finally {
    conn.release();
  }
};

// 출고 등록
const insertFinalRelease = async (release) => {
  // 출고 상태 계산
  let stat = "";
  const { req_qtt, outbnd_qtt } = release;

  if (outbnd_qtt === 0) {
    stat = "출고대기";
  } else if (outbnd_qtt < req_qtt) {
    stat = "부분출고";
  } else if (outbnd_qtt === req_qtt) {
    stat = "출고완료";
  }

  const values = [
    release.poutbnd_code,
    req_qtt,
    outbnd_qtt,
    release.deadline,
    stat,
    release.outbound_request_code,
    release.lot_num,
    release.prod_code,
    release.client_code,
    release.mcode
  ];

  const result = await mariadb.query("insertRelease", values).catch(err => console.log(err));
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
    const ordCode = ordCodeRes[0].ord_code; //결과 배열의 첫 번째 행에서 ord_code 컬럼의 값 가져오기
    const insertColumns = ['ord_code', 'ord_name', 'ord_date', 'ord_stat', 'note', 'mcode', 'client_code',];
    const detailColumns = ['ord_d_code', 'unit', 'spec', 'prod_amount', 'prod_price', 'delivery_date', 'ord_priority', 'total_price', 'ord_code', 'prod_code'];
    // 주문 저장
    data.orderData.ord_code = ordCode;
    const result = await mariadb.queryConn(conn, "insertOrder", convertObjToAry(data.orderData, insertColumns)); // 메인 등록: 주문서

    // 주문 상세 등록
    // 트랜잭션 내에서 실행
    for (const values of data.detailData) { // 주문서 상세
      // 주문 상세 코드 생성
      const ordDCodeRes = await mariadb.queryConn(conn, "selectOrdDCodeForUpdate");
      const ordDCode = ordDCodeRes[0].ord_d_code;

      values.ord_code = ordCode;
      values.ord_d_code = ordDCode;

      await mariadb.queryConn(conn, "insertOrderDetail", convertObjToAry(values, detailColumns));
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

// 주문 삭제 (트랜잭션)
const deleteOrderTx = async (ordCode) => {
  const conn = await mariadb.connectionPool.getConnection();
  try {
    await conn.beginTransaction();
    // 상세 먼저 삭제 → 마스터 삭제
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

// 출고 삭제 (트랜잭션)
const deleteReleaseTx = async (outReqCode) => {
  const conn = await mariadb.connectionPool.getConnection();

  try {
    await conn.beginTransaction();    
    await mariadb.queryConn(conn, "deleteReleaseDetail", [outReqCode]);
    await mariadb.queryConn(conn, "deleteRelease", [outReqCode]);
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

// 출고 상태 목록 조회
const findReleaseStatuses = async () => {
  const result = await mariadb.query("selectReleaseStatuses")
    .catch(err => console.log(err));
  return result;
};

// 출고 데이터 목록 조회
const findReleaseList = async () => {
  const result = await mariadb.query("selectReleaseList")
    .catch(err => console.log(err));
  return result;
};

// 출고 상태 업데이트
const updateReleaseStat = async (stat, poutbnd_code) => {
  const result = await mariadb.query("updateReleaseStatus", [stat, poutbnd_code])
    .catch(err => console.log(err));
  return result;
};



module.exports ={
    // 해당 객체에 등록해야지 외부로 노출
    findAllOrders,
    findOrderDetails,
    findOrdersWithDate,
    findOrdersByCondition,
    findClientList,
    findOrderStatuses,
    findProductList,
    findProductByName,
    insertOrder,
    insertOrderDetail,
    insertOrderTx,
    deleteOrderTx,
    selectReleaseList,
    selectReleaseDetailList,
    insertReleaseTx,
    deleteReleaseTx,
    findReleaseStatuses,
    findReleaseList,
    updateReleaseStat,
    insertFinalRelease
};