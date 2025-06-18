// 한달 목록 조회
const getCurrentMonthPlans =`
SELECT  prdr.prdr_code,
        work_order_code,
        prdr.prod_code,
        p.prod_name,  
        prdr.start_date,
        prdr.end_date,
        TIME_FORMAT(TIMEDIFF(prdr.end_date, prdr.start_date), '%H:%i') AS total_time,
        prdr.production_qtt,
        prdr.perform_rate
FROM    prdr_tbl prdr
LEFT JOIN prod_tbl p ON prdr.prod_code = p.prod_code
WHERE CONVERT_TZ(prdr.start_date, '+00:00', '+09:00') BETWEEN ? AND ?
ORDER BY prdr.start_date;
`;

// 검색조건 쿼리
const searchPrdr = `
  SELECT  
    prdr.prdr_code,
    prdr.work_order_code,
    prdr.prod_code,
    p.prod_name,
    prdr.start_date,
    prdr.end_date,
    prdr.production_qtt,
    prdr.perform_rate
  FROM    prdr_tbl prdr
  LEFT JOIN prod_tbl p ON prdr.prod_code = p.prod_code
  WHERE 1=1
    AND (? IS NULL OR prdr.prdr_code LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR prdr.work_order_code LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR p.prod_name LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR prdr.start_date >= ?)
    AND (? IS NULL OR prdr.end_date <= ?)
  ORDER BY prdr.start_date;
`;
const selectPrdrOne = `
SELECT  p.prdr_code,
        p.start_date,
        p.end_date,
        p.total_time,
        p.note, 
        p.production_qtt, 
        p.perform_rate, 
        p.work_order_code, 
        p.emp_code, 
        p.prod_code,
        w.wko_qtt,
        pd.line_code
FROM prdr_tbl p
JOIN wko_tbl w ON p.work_order_code = w.wko_code
JOIN prdp_d_tbl pd 
    ON w.prdp_code = pd.prdp_code AND p.prod_code = pd.prod_code
WHERE p.prdr_code = ?
`;

// 상세에 맞는 설비 들고오는 쿼리
const selectEquipmentByPrdr= `
SELECT eq.eq_code, eq.eq_name
FROM prdr_tbl p
JOIN wko_tbl w ON p.work_order_code = w.wko_code
JOIN prdp_d_tbl pd ON w.prdp_code = pd.prdp_code AND p.prod_code = pd.prod_code
JOIN line_d_tbl ld ON pd.line_code = ld.line_code
JOIN eq_tbl eq ON ld.eq_code = eq.eq_code
WHERE p.prdr_code = ?
`;

const simpleSelectPrdr = `
SELECT p.prdr_code
       ,d.prod_name
       ,p.end_date
       ,p.production_qtt
FROM prdr_tbl p
JOIN prod_tbl d ON p.prod_code = d.prod_code
`;

module.exports = {
  getCurrentMonthPlans,
  searchPrdr,
  selectPrdrOne,
  selectEquipmentByPrdr,
  simpleSelectPrdr
}