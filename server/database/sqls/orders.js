
// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )


// 주문 전체 조회
const selectOrderList = `
  SELECT ord_code
       , ord_name
       , ord_date
       , note
       , mcode
       , client_code
  FROM ord_tbl
  ORDER BY ord_code
`;

// 주문 상세 조회
const selectOrderDetailList = `
  SELECT od.ord_code
       , od.prod_code
       , od.prod_amount
       , od.prod_price
       , od.delivery_date
       , od.ord_priority
       , od.total_price
       , p.prod_name
       , p.unit
       , p.spec
       , p.note
  FROM ord_d_tbl od
  JOIN prod_tbl p ON od.prod_code = p.prod_code
  WHERE od.ord_code = ?
`;

// 주문 등록
const insertOrder = `
  INSERT INTO ord_tbl(ord_code,
                      ord_name,
                      ord_date,
                      ord_stat,
                      note,
                      mcode,
                      client_code)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// 주문 상세 등록
const insertOrderDetail = `
  INSERT INTO ord_d_tbl(ord_code,
                        prod_code,
                        prod_amount,
                        prod_price,
                        delivery_date,
                        ord_priority,
                        total_price)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// //
// DECLARE
//   my_variable NUMBER;
//   another_variable VARCHAR2(20);
//   date_value DATE;
// BEGIN

//   my_variable := 10;
//   another_variable := 'Hello, world!';
//   date_value := SYSDATE;

//   DBMS_OUTPUT.PUT_LINE('my_variable: ' || my_variable);
//   DBMS_OUTPUT.PUT_LINE('another_variable: ' || another_variable);
//   DBMS_OUTPUT.PUT_LINE('date_value: ' || date_value);

// END;
// /


// 주문 삭제
const deleteOrder = `
  DELETE FROM ord_tbl WHERE ord_code = ?
`;

// 주문 상세 삭제
const deleteOrderDetail = `
  DELETE FROM ord_d_tbl WHERE ord_code = ?
`;

// 거래처 전체 조회
const selectClientList = `
  SELECT client_code,
         client_name,
         client_mname
  FROM client_tbl
  ORDER BY client_name
`;

// 제품 조회
//제품명, 유형, 규격, 단위, 수량, 단가, 납기일, 우선순위, 총액
//주문상세 테이블: 
const selectProductList = `
  SELECT ord_d_code
       , 제품명
       , 유형
       , unit
       , spec
       , prod_amount
       , prod_price
       , delivery_date,
       , ord_priority,
       , total_price
  FROM ord_d_tbl
  ORDER BY ord_code
`;

// SELECT ord_code for new insert
const selectOrdCodeForUpdate = `
SELECT CONCAT(
              CONCAT('ORD-', DATE_FORMAT( CURDATE(), '%Y')), 
              LPAD(IFNULL(MAX(SUBSTR(ord_code, -4)), 0) + 1, 4, '0')
             )
FROM ord_tbl
WHERE SUBSTR(ord_code, 5, 4) = DATE_FORMAT( CURDATE(), '%Y')
FOR UPDATE
`;

module.exports = {
    selectOrderList,
    selectOrderDetailList,
    insertOrder,
    insertOrderDetail,
    deleteOrder,
    deleteOrderDetail,
    selectClientList,
    selectProductList,
    selectOrdCodeForUpdate,
}