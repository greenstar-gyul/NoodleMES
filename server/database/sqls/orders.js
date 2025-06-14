
// 각 변수별로 SQL문을 등록할 때 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )


// 주문 전체 조회
// mcode 등록자를 뜻함..
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
       , od.ord_d_code
       , od.prod_code
       , od.prod_amount
       , od.prod_price
       , od.delivery_date
       , od.ord_priority
       , od.total_price
       , p.prod_name
       , comm_name(p.unit) AS unit
       , comm_name(p.spec) AS spec
       , p.note
       , comm_name(p.com_value) AS com_value
  FROM ord_d_tbl od
  JOIN prod_tbl p ON od.prod_code = p.prod_code
  WHERE od.ord_code = ?
`;

// 날짜 조건 반영을 위한 주문 조회
const selectOrderListWithDate = `
  SELECT DISTINCT o.ord_code,
         o.ord_name,
         o.ord_date,
         o.note,
         c.client_name,
         comm_name(o.ord_stat) AS ord_stat,
         d.prod_amount,
         d.delivery_date
  FROM ord_tbl o
  INNER JOIN ord_d_tbl d ON o.ord_code = d.ord_code
  LEFT JOIN client_tbl c ON o.client_code = c.client_code
  WHERE o.ord_date BETWEEN ? AND ?
  ORDER BY o.ord_code
`;

//검색조건에 맞는 주문 조회
const selectOrderListByCondition = `
  SELECT DISTINCT o.ord_code
       , o.ord_name
       , o.ord_date
       , o.note
       , c.client_name 
       , comm_name(o.ord_stat) AS ord_stat
       , d.prod_amount
       , d.delivery_date
  FROM ord_tbl o
  INNER JOIN ord_d_tbl d ON o.ord_code = d.ord_code
  INNER JOIN client_tbl c ON o.client_code = c.client_code
  WHERE 1=1
    AND (? IS NULL OR o.ord_date >= ?)
    AND (? IS NULL OR o.ord_date <= ?)
    AND (? IS NULL OR o.ord_code LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR o.ord_name LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR o.client_code IN (
      SELECT client_code FROM client_tbl WHERE client_name LIKE CONCAT('%', ?, '%')
    ))
    AND (? IS NULL OR o.ord_stat = ?)
    AND (? IS NULL OR d.prod_amount >= ?)
    AND (? IS NULL OR d.prod_amount <= ?)
    AND (? IS NULL OR d.delivery_date >= ?)
    AND (? IS NULL OR d.delivery_date <= ?)
  ORDER BY o.ord_code
`;


// 거래처 전체 조회
const selectClientList = `
  SELECT client_code,
         client_name,
         client_mname
  FROM client_tbl
  ORDER BY client_name
`;

// 주문 상태 조회
const selectOrderStatuses = `
  SELECT comm_name(com_value) as status_code,
         comm_name(com_value) as status_name
  FROM   common_code
  WHERE  group_value = '0A' -- 주문 상태 코드 그룹
`;

// 제품 전체 조회
const selectProductList = `
  SELECT prod_code,
         prod_name,
         note,
         comm_name(unit) as unit,
         comm_name(spec) as spec,
         comm_name(com_value) as com_value
    FROM prod_tbl
   ORDER BY prod_code
`;

// 제품명 검색 조회
const selectProductByName = `
  SELECT prod_code,
         prod_name,
         comm_name(com_value) as com_value,
         comm_name(unit) as unit,
         comm_name(spec) as spec,
         note
    FROM prod_tbl
   WHERE prod_name LIKE CONCAT('%', ?, '%')
   ORDER BY prod_name
`;

// 공통코드: 규격 (0O, 0X, 0Y)
// const selectSpecCodes = `
//   SELECT comm_name(com_value) AS value,
//          comm_name(com_value) AS label
//   FROM common_code
//   WHERE group_value in('0O', '0X', '0Y') 
// `;

// 공통코드: 단위 (0H)
// const selectUnitCodes = `
//   SELECT comm_name(com_value) AS value,
//          comm_name(com_value) AS label
//   FROM common_code
//   WHERE group_value = '0H'
// `;

// 주문 코드 생성용 (FOR UPDATE 잠금)
const selectOrdCodeForUpdate = `
SELECT CONCAT(
              CONCAT('ORD-', DATE_FORMAT( CURDATE(), '%Y')), 
              LPAD(IFNULL(MAX(SUBSTR(ord_code, -4)), 0) + 1, 4, '0')
             ) AS ord_code
FROM ord_tbl
WHERE SUBSTR(ord_code, 5, 4) = DATE_FORMAT( CURDATE(), '%Y')
FOR UPDATE
`;

// 주문상세 코드 생성용 (ORD-D-0001 형식)
// CAST: 형변환
// LPAD(..., 4, '0'): 4자리 0001이런식으로 0채우기
const selectOrdDCodeForUpdate = `
  SELECT CONCAT(
           'ORD-D-', 
           LPAD(IFNULL(MAX(CAST(SUBSTR(ord_d_code, 7, 4) AS UNSIGNED)), 0) + 1, 4, '0')
         ) AS ord_d_code
  FROM ord_d_tbl
  WHERE SUBSTR(ord_d_code, 1, 5) = 'ORD-D'
  FOR UPDATE
`;

// 주문 등록
const insertOrder = `
  INSERT INTO ord_tbl (
    ord_code,
    ord_name,
    ord_date,
    ord_stat,
    note,
    mcode,
    client_code
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// 주문 상세 등록
const insertOrderDetail = `
  INSERT INTO ord_d_tbl (
    ord_d_code,
    unit,
    spec,
    prod_amount,
    prod_price,
    delivery_date,
    ord_priority,
    total_price,
    ord_code,
    prod_code
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// 주문 삭제
const deleteOrder = `
  DELETE FROM ord_tbl WHERE ord_code = ?
`;

// 주문 상세 삭제
const deleteOrderDetail = `
  DELETE FROM ord_d_tbl WHERE ord_code = ?
`;


module.exports = {
  // 조회
  selectOrderList,
  selectOrderDetailList,
  selectClientList,
  selectProductList,
  selectProductByName,
  selectOrderStatuses,
  selectOrderListWithDate,
  selectOrderListByCondition,

  // 등록
  selectOrdCodeForUpdate,
  selectOrdDCodeForUpdate,
  insertOrder,
  insertOrderDetail,

  // 삭제
  deleteOrder,
  deleteOrderDetail
};