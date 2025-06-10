
// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )


// 주문 전체 조회
const selectOrderList = `
  SELECT ord_code
       , ord_name
       , ord_date
       , ord_stat
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

module.exports = {
    selectOrderList,
    selectOrderDetailList,
    insertOrder,
    insertOrderDetail,
    deleteOrder,
    deleteOrderDetail,
    selectClientList
}