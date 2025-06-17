// 한달 목록 조회
const getCurrentMonthPlans =`
SELECT  w.wko_code,
        w.prod_code,
        p.prod_name,
        comm_name(w.stat) AS "stat",
        w.reg_date,
        w.line_code
FROM    wko_tbl w
LEFT JOIN prod_tbl p ON w.prod_code = p.prod_code
WHERE CONVERT_TZ(w.reg_date, '+00:00', '+09:00') BETWEEN ? AND ?
ORDER BY w.wko_code ;
`;


module.exports = {
  getCurrentMonthPlans,
}