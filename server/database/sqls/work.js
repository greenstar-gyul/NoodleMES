
// 작업진행 목록 조회 (작업완료 제외)
const getCurrentMonthPlan = `
SELECT  w.wko_code,
        w.prod_code,
        p.prod_name,
        w.wko_qtt,
        comm_name(w.stat) AS "stat",
        w.reg_date,
        w.start_date,
        w.end_date,
        w.line_code
FROM    wko_tbl w
LEFT JOIN prod_tbl p ON w.prod_code = p.prod_code
WHERE CONVERT_TZ(w.reg_date, '+00:00', '+09:00') BETWEEN ? AND ?
  AND w.stat != 'v2'  -- ✅ 작업완료 제외 조건 추가
ORDER BY w.wko_code;
`;


// 작업진행 조건 검색
const searchWorkingList = `
SELECT  w.wko_code,
        w.prod_code,
        p.prod_name,
        w.wko_qtt,
        comm_name(w.stat) AS "stat",
        w.reg_date,
        w.start_date,
        w.end_date,
        w.line_code
FROM    wko_tbl w
LEFT JOIN prod_tbl p ON w.prod_code = p.prod_code
WHERE 1 = 1
  AND w.stat != 'v2'  -- 작업완료 제외
  AND (? IS NULL OR w.wko_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR p.prod_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR w.line_code LIKE CONCAT('%', ?, '%'))
  AND (
    (? IS NULL OR ? IS NULL)
    OR CONVERT_TZ(w.reg_date, '+00:00', '+09:00') BETWEEN ? AND ?
  )
ORDER BY w.wko_code;
`;

module.exports = {
  getCurrentMonthPlan,
  searchWorkingList
}