
// 각 변수별로 SQL문을 등록할 때 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 생산계획 전체조회
const selectPrdpList =
`SELECT prdp_code
        , prdp_name 
        , prdp_date
        , start_date
        , end_date
        , due_date
        , reg
        , ord_code
        , note

FROM prdp_tbl
ORDER BY prdp_code`;

// 오늘날짜를 기준으로 해당하는 달에 내용만 조회
const getCurrentMonthPlans = `
SELECT prdp_code
     , prdp_name 
     , prdp_date
     , start_date
     , end_date
     , due_date
     , reg
     , note
FROM prdp_tbl
WHERE YEAR(prdp_date) = YEAR(CURDATE())
  AND MONTH(prdp_date) = MONTH(CURDATE())
ORDER BY prdp_code`;


// 생산계획 상세 조회
const selectPrdpDOne = `
SELECT  d.prdp_d_code,
        d.planned_qtt,
        d.priority,
        d.prod_code,
        p.prod_name,
        p.com_value AS com_value,                  -- 제품유형 코드
        comm_name(p.com_value) AS com_value_name, -- 제품유형명 (봉지라면 등)
        comm_name(p.unit) AS unit,
        comm_name(p.spec) AS spec,
        d.emp_code,
        d.prdp_code,
        d.line_code
FROM prdp_d_tbl d
JOIN prod_tbl p ON d.prod_code = p.prod_code
WHERE d.prdp_code = ?
`;

// 주문정보 목록 조회
const selectOrdList = 
`SELECT 
        ord.ord_code,
        ordd.prod_code,
        p.prod_name,
        ordd.prod_amount,
        ord.ord_name,
        ord.ord_date
FROM    ord_d_tbl ordd
JOIN    ord_tbl ord ON ordd.ord_code = ord.ord_code
JOIN    prod_tbl p ON ordd.prod_code = p.prod_code
ORDER BY ord.ord_date
`;

// 설비 목록 조회
const selectLineList = `
SELECT line_code, 
       line_name, 
       is_used 
FROM  line_tbl 
WHERE line_type = ?
ORDER BY line_code
`;


// 제품 목록 조회
const selectProdList = 
`SELECT prod_code,
        prod_name,
        comm_name(spec) AS "spec",
        comm_name(unit) AS "unit",
        comm_name(com_value) AS "com_value"
FROM prod_tbl
ORDER BY prod_code`;


// 생산 계획 등록
const insertPrdp = `
  INSERT INTO prdp_tbl(prdp_code,
                       prdp_name,
                       prdp_date,
                       due_date,
                       reg,
                       note,
                       start_date,
                       end_date,
                       ord_code)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// 생산계획 상세 등록
const insertPrdpDetail = `
INSERT INTO prdp_d_tbl(emp_code,
                      line_code,
                      planned_qtt,
                      prdp_code,
                      prdp_d_code,
                      priority,
                      prod_code)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// 생산계획 수정
const updatePrdp = `
  UPDATE prdp_tbl
  SET prdp_name = ?,
      due_date = ?,
      note = ?
      start_date = ?,
      end_date = ?,
  WHERE prdp_code = ?
`;

// 생산계획 상세 수정
const updatePrdpDetail = `
  UPDATE prdp_d_tbl
  SET   emp_code = ?,
        line_code = ?
        planned_qtt = ?,
        priority = ?,
        prod_code = ?,
  WHERE prdp_d_code = ?;
`;

const searchPrdp =  `
    SELECT  prdp_code
          , prdp_name 
          , prdp_date
          , start_date
          , end_date
          , due_date
          , reg
          , note
    FROM prdp_tbl
    WHERE 1=1
      AND (? IS NULL OR prdp_code LIKE CONCAT('%', ?, '%'))
      AND (? IS NULL OR prdp_name LIKE CONCAT('%', ?, '%'))
      AND (? IS NULL OR prdp_date >= ?)
      AND (? IS NULL OR prdp_date <= ?)
      AND (? IS NULL OR due_date >= ?)
      AND (? IS NULL OR due_date <= ?)
    ORDER BY prdp_date;
  `;

// 주문 삭제
const deletePrdp = `
  DELETE FROM prdp_tbl WHERE prdp_code = ?
`;

// 주문 상세 삭제
const deletePrdpDetail = `
  DELETE FROM prdp_d_tbl WHERE prdp_code = ?
`;


// prdp_code 자동생성 
// SELECT prdp_code for new insert
const selectPrdpCodeForUpdate = `
SELECT CONCAT('PRDP-', DATE_FORMAT(CURDATE(), '%Y%m'), '-', LPAD(COUNT(*) + 1, 4, '0')) AS new_code
FROM prdp_tbl
WHERE SUBSTRING(prdp_code, 6, 6) = DATE_FORMAT(CURDATE(), '%Y%m')
FOR UPDATE;
`;

// prdp_d_code 생성
const selectPrdpDCodeForUpdate = `
SELECT CONCAT('PRDP-D-', 
              LPAD(IFNULL(MAX(CAST(SUBSTRING(prdp_d_code, 9) AS UNSIGNED)), 0) + 1, 4, '0')
             ) AS new_d_code
FROM prdp_d_tbl
FOR UPDATE;
`;


module.exports = {
    selectPrdpList,
    getCurrentMonthPlans,
    selectPrdpDOne,
    selectOrdList,
    selectLineList,
    selectProdList,
    searchPrdp,
    insertPrdp,
    insertPrdpDetail,
    updatePrdp,
    updatePrdpDetail,
    deletePrdp,
    deletePrdpDetail,
    selectPrdpCodeForUpdate,
    selectPrdpDCodeForUpdate
}