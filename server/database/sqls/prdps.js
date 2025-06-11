
// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 조건없이 전체조회
const selectPrdpList =
`SELECT prdp_code
        , prdp_name 
        , prdp_date
        , start_date
        , end_date
        , due_date
        , reg
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


const selectPrdpDOne = `
SELECT d.prdp_d_code,
       d.planned_qtt,
       d.priority,
       d.prod_code,
       p.prod_name,
       d.emp_code,
       d.prdp_code,
       d.line_code
FROM prdp_d_tbl d
JOIN prod_tbl p ON d.prod_code = p.prod_code
WHERE d.prdp_code = ?`;

const selectLineList = 
`SELECT line_code,
        line_name,
        is_used

FROM line_tbl
ORDER BY line_code`;

const selectProdList = 
`SELECT prod_code,
        prod_name,
        prod_type,
        is_used,
        unit
        
FROM prod_tbl
ORDER BY prod_code`;


module.exports = {
    selectPrdpList,
    getCurrentMonthPlans,
    selectPrdpDOne,
    selectLineList,
    selectProdList
}