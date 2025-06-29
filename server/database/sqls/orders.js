
// 각 변수별로 SQL문을 등록할 때 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )


////주문 관련 SQL문

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
       , od.ord_amount
       , od.prod_price
       , od.delivery_date
       , od.ord_priority
       , od.total_price
       , p.prod_name
       , p.unit AS unit_code
       , comm_name(p.unit) AS unit
       , p.spec AS spec_code
       , comm_name(p.spec) AS spec
       , p.note
       , comm_name(p.com_value) AS com_value
       , p.com_value AS com_value_code
       , ps.cur_qtt AS stock_qtt
       , ps.unit AS stock_unit
  FROM ord_d_tbl od
  JOIN prod_tbl p ON od.prod_code = p.prod_code
  JOIN prod_stock_v ps ON od.prod_code = ps.prod_code
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
         d.ord_amount,
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
       , d.ord_amount
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
    AND (? IS NULL OR d.ord_amount >= ?)
    AND (? IS NULL OR d.ord_amount <= ?)
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
          com_value AS com_value_code,
          comm_name(com_value) AS com_value,
          unit AS unit_code,
          comm_name(unit) AS unit,
          spec AS spec_code,
          comm_name(spec) AS spec,
          note
  FROM prod_tbl
  WHERE prod_type = 'i1'
  ORDER BY prod_name
`;

// 제품명 검색 조회
const selectProductByNames = `
  SELECT prod_code,
        prod_name,
        comm_name(com_value) as com_value,
        comm_name(unit) as unit,
        comm_name(spec) as spec,
        note
  FROM prod_tbl
  WHERE prod_type = 'i1'
  ORDER BY prod_name
`;

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
    ord_amount,
    prod_price,
    delivery_date,
    ord_priority,
    total_price,
    ord_code,
    prod_code
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// 주문 수정
const updateOrder = `
  UPDATE ord_tbl
     SET ord_name = ?,
         ord_date = ?,
         ord_stat = ?,
         note = ?,
         mcode = ?,
         client_code = ?
   WHERE ord_code = ?
`;

// 주문 삭제
const deleteOrder = `
  DELETE FROM ord_tbl WHERE ord_code = ?
`;

// 주문 상세 삭제
const deleteOrderDetail = `
  DELETE FROM ord_d_tbl WHERE ord_code = ?
`;





////출고 관련 SQL문

// 출고 상태 조회
const selectReleaseStatuses = `
  SELECT com_value AS status_code,
         comm_name(com_value) AS status_name
    FROM common_code
   WHERE group_value = '0Q' -- 출고 상태 코드 그룹
`;

// 출고 데이터 목록 조회
const selectReleaseList = `
  SELECT p.poutbnd_code,
         p.req_qtt,
         p.outbnd_qtt,
         p.deadline,
         p.outbound_request_code,
         r.out_req_date,
         r.ord_code,
         p.lot_num,
         prod.prod_name,
         comm_name(prod.com_value) AS com_value,
         c.client_name,
         e.emp_name AS mcode
    FROM poutbnd_tbl p
    JOIN out_req_tbl r ON p.outbound_request_code = r.out_req_code
    JOIN prod_tbl prod ON p.prod_code = prod.prod_code
    JOIN client_tbl c ON p.client_code = c.client_code
    JOIN emp_tbl e ON p.mcode = e.emp_code
   ORDER BY p.poutbnd_code
`;

// 출고 상태 변경
const updateReleaseStatus = `
  UPDATE poutbnd_tbl
  SET stat = ?
  WHERE poutbnd_code = ?
`;

// 출고요청코드 자동 생성 (예: OUT-20250617-0001)
const selectOutReqCodeForUpdate = `
  SELECT CONCAT('OUT-', DATE_FORMAT(CURDATE(), '%Y%m%d'), '-',
           LPAD(IFNULL(MAX(CAST(SUBSTR(out_req_code, 14, 4) AS UNSIGNED)), 0) + 1, 4, '0')
         ) AS out_req_code
  FROM out_req_tbl
  WHERE SUBSTR(out_req_code, 5, 8) = DATE_FORMAT(CURDATE(), '%Y%m%d')
  FOR UPDATE
`;

// 출고요청상세코드 자동 생성 (예: OUT-20250617-0001-D0001)
const selectOutReqDCodeForUpdate = `
  SELECT CONCAT(?, '-D', LPAD(IFNULL(MAX(CAST(SUBSTR(out_req_d_code, LENGTH(?) + 4, 4) AS UNSIGNED)),0) + 1, 4, '0')
         ) AS out_req_d_code
  FROM out_req_d_tbl
  WHERE out_req_d_code LIKE CONCAT(?, '-D%')
  FOR UPDATE
`;

// 본출고코드 자동 생성 (예: OUT-20250617-0001-P0001)
const selectReleaseCodeForUpdate = `
  SELECT CONCAT(?, '-P', LPAD(IFNULL(MAX(CAST(SUBSTR(poutbnd_code, LENGTH(?) + 4, 4) AS UNSIGNED)),0) + 1, 4, '0')
         ) AS poutbnd_code
  FROM poutbnd_tbl
  WHERE poutbnd_code LIKE CONCAT(?, '-P%')
  FOR UPDATE
`;

// 출고요청 등록
const insertOutReq = `
  INSERT INTO out_req_tbl (
    out_req_code,
    ord_code,
    out_req_date,
    mcode,
    note,
    ord_predict_date,
    client_code  
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// 출고요청 상세 등록
const insertOutReqDetail = `
  INSERT INTO out_req_d_tbl (
    out_req_d_code,
    out_req_d_amount,
    com_value,
    ord_amount,
    out_req_code,
    prod_code   
  ) VALUES (?, ?, ?, ?, ?, ?)
`;

// 출고 본테이블 등록
const insertRelease = `
  INSERT INTO poutbnd_tbl (
  poutbnd_code,
  req_qtt,
  outbnd_qtt,
  deadline,
  stat,
  outbound_request_code,
  lot_num,
  prod_code,
  client_code,
  mcode
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// 출고 정보 수정
const updateRelease = `
  UPDATE poutbnd_tbl
     SET req_qtt = ?,
         outbnd_qtt = ?,
         deadline = ?,
         stat = ?,
         outbound_request_code = ?,
         lot_num = ?,
         prod_code = ?,
         mcode = ?
   WHERE poutbnd_code = ?
`;

// 출고 상세 정보 조회
const selectReleaseDetailList = `
  SELECT 
         p.poutbnd_code,
         p.req_qtt,
         p.outbnd_qtt,
         p.deadline,
         p.stat,
         p.outbound_request_code,
         r.out_req_date,
         r.ord_code,
         r.note,
         p.lot_num,
         p.prod_code,
         pr.prod_name,
         comm_name(pr.com_value) AS com_value,
         pr.com_value AS com_value_code,
         p.client_code,
         c.client_name,
         p.mcode,
         e.emp_name,
         total.total_order_qtt AS total_order_qtt,
         total.total_release_qtt AS total_release_qtt
    FROM poutbnd_tbl p
    JOIN out_req_tbl r ON p.outbound_request_code = r.out_req_code
    JOIN prod_tbl pr ON p.prod_code = pr.prod_code
    JOIN client_tbl c ON p.client_code = c.client_code
    JOIN emp_tbl e ON p.mcode = e.emp_code
    JOIN (
        SELECT outbound_request_code,
               SUM(req_qtt) AS total_order_qtt,
               SUM(outbnd_qtt) AS total_release_qtt
          FROM poutbnd_tbl
         GROUP BY outbound_request_code
    ) AS total ON p.outbound_request_code = total.outbound_request_code
   WHERE p.outbound_request_code = ?
   ORDER BY p.poutbnd_code
`;



//출고 불러오기 팝업
const releaseList = `
  SELECT 
    r.out_req_code,
    r.ord_code,
    r.out_req_date,
    r.note,
    c.client_name,
    e.emp_name AS mcode,
    SUM(p.req_qtt) AS total_order_qtt,
    SUM(p.outbnd_qtt) AS total_release_qtt
  FROM out_req_tbl r
  JOIN poutbnd_tbl p ON r.out_req_code = p.outbound_request_code
  JOIN client_tbl c ON r.client_code = c.client_code
  JOIN emp_tbl e ON r.mcode = e.emp_code
  GROUP BY r.out_req_code, r.ord_code, r.out_req_date, r.note, c.client_name, e.emp_name
  ORDER BY r.out_req_code
`;


// 사용 가능한 LOT 중 가장 오래된 LOT 1개 조회
const selectLotByProduct = `
  SELECT lot_num
  FROM lot_tbl
  WHERE prod_code = ?
  ORDER BY issdate ASC
  LIMIT 1
`;

// 총 주문수량
const sumOrderQ = `
  SELECT SUM(ord_amount) AS total_order_qtt
  FROM out_req_d_tbl
  WHERE out_req_code = ?
`;

// 총 출고수량
const sumReleaseQ = `
  SELECT SUM(outbnd_qtt) AS total_release_qtt
  FROM poutbnd_tbl
  WHERE outbound_request_code = ?
`;

// 제품 상세 조회
const selectRProdByOutReqCode = `
  SELECT 
    p.poutbnd_code,
    p.prod_code,
    pr.prod_name,
    p.req_qtt,
    p.outbnd_qtt,
    p.deadline,
    comm_name(c.com_value) AS com_value,
    o.out_req_d_amount,
    o.ord_amount,
    comm_name(pr.spec) AS spec,
    comm_name(pr.unit) AS unit
  FROM poutbnd_tbl p
  JOIN out_req_d_tbl o 
      ON p.prod_code = o.prod_code 
    AND p.outbound_request_code = o.out_req_code
  JOIN prod_tbl pr 
      ON pr.prod_code = p.prod_code
  JOIN common_code c 
      ON pr.com_value = c.com_value
  LEFT JOIN common_code unit_cd
      ON pr.unit = unit_cd.com_value
    AND unit_cd.group_value = '0H'
  LEFT JOIN common_code spec_cd
      ON pr.spec = spec_cd.com_value
    AND spec_cd.group_value = 
        CASE 
          WHEN pr.prod_type = 'j1' THEN '0O'  -- 봉지라면
          WHEN pr.prod_type = 'j2' THEN '0X'  -- 컵라면(대)
          WHEN pr.prod_type = 'j3' THEN '0Y'  -- 컵라면(소)
        END
  WHERE p.outbound_request_code = ?
`;


// 출고요청 목록 조회 (출고요청상세, 제품, 출고수량, 출고일자, 담당자명, 거래처명, 출고상태명 포함)
const releaseDataForLists = `
  SELECT d.out_req_d_code,
         prod.prod_name,
         p.outbnd_qtt AS outbnd_qtt,
         r.out_req_date,
         e.emp_name,
         c.client_name,
         comm_name(p.stat) AS stat
    FROM out_req_d_tbl d
    JOIN out_req_tbl r 
      ON d.out_req_code = r.out_req_code
    LEFT JOIN poutbnd_tbl p 
      ON p.outbound_request_code = d.out_req_code
     AND p.prod_code = d.prod_code
    JOIN prod_tbl prod 
      ON d.prod_code = prod.prod_code
    JOIN emp_tbl e 
      ON r.mcode = e.emp_code
    JOIN client_tbl c 
      ON r.client_code = c.client_code
    WHERE p.outbnd_qtt IS NOT NULL
     AND  p.outbnd_qtt > 0
   ORDER BY d.out_req_d_code
`;

// 출고 목록 검색 조회
const findReleaseDataForList = `
  SELECT d.out_req_d_code,
         prod.prod_name,
         p.outbnd_qtt,
         r.out_req_date,
         e.emp_name,
         c.client_name,
         comm_name(p.stat) AS stat
    FROM out_req_d_tbl d
    JOIN out_req_tbl r 
      ON d.out_req_code = r.out_req_code
    LEFT JOIN poutbnd_tbl p 
      ON p.outbound_request_code = d.out_req_code
     AND p.prod_code = d.prod_code
    JOIN prod_tbl prod 
      ON d.prod_code = prod.prod_code
    JOIN emp_tbl e 
      ON r.mcode = e.emp_code
    JOIN client_tbl c 
      ON r.client_code = c.client_code
   WHERE 1 = 1
     AND (? IS NULL OR d.out_req_d_code LIKE CONCAT('%', ?, '%'))
     AND (? IS NULL OR prod.prod_name LIKE CONCAT('%', ?, '%'))
     AND (? IS NULL OR p.outbnd_qtt >= ?)
     AND (? IS NULL OR p.outbnd_qtt <= ?)
     AND (? IS NULL OR r.out_req_date >= ?)
     AND (? IS NULL OR r.out_req_date <= ?)
     AND (? IS NULL OR c.client_name LIKE CONCAT('%', ?, '%'))
     AND (? IS NULL OR e.emp_name LIKE CONCAT('%', ?, '%'))
     AND p.outbnd_qtt IS NOT NULL
     AND p.outbnd_qtt > 0
   ORDER BY d.out_req_d_code
`;

// 본출고 삭제 (출고요청코드 기준)
const deletePoutbndByOutReqCode = `
  DELETE FROM poutbnd_tbl WHERE outbound_request_code = ?
`;

// 출고요청상세 삭제
const deleteOutReqDetail = `
  DELETE FROM out_req_d_tbl WHERE out_req_code = ?
`;

// 출고요청 삭제
const deleteOutReq = `
  DELETE FROM out_req_tbl WHERE out_req_code = ?
`;




module.exports = {
  // 조회
  selectOrderList,
  selectOrderDetailList,
  selectClientList,
  selectProductList,
  selectProductByNames,
  selectOrderStatuses,
  selectOrderListWithDate,
  selectOrderListByCondition,
  selectReleaseStatuses,
  selectReleaseList,
  selectReleaseDetailList,
  selectLotByProduct,
  sumOrderQ,
  sumReleaseQ,
  selectRProdByOutReqCode,
  releaseList,
  releaseDataForLists,
  findReleaseDataForList,

  // 등록
  selectOrdCodeForUpdate,
  selectOrdDCodeForUpdate,
  insertOrder,
  insertOrderDetail,
  updateReleaseStatus,
  selectOutReqCodeForUpdate,
  selectOutReqDCodeForUpdate,
  selectReleaseCodeForUpdate,
  insertOutReq,
  insertOutReqDetail,
  insertRelease,

  // 삭제
  deleteOrder,
  deleteOrderDetail,
  deletePoutbndByOutReqCode,
  deleteOutReqDetail,
  deleteOutReq,

  // 수정
  updateOrder,
  updateRelease
};