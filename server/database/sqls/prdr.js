const getCurrentMonthPlans =`
SELECT  prdr.prdr_code,
        work_order_code,
        comm_name(prdr.process_type) AS "process_type",
        prdr.prod_code,
        p.prod_name,
        prdr.start_date,
        prdr.end_date,
        prdr.production_qtt,
        prdr.peform_rate
FROM    prdr_tbl prdr
LEFT JOIN prod_tbl p ON prdr.prod_code = p.prod_code
WHERE CONVERT_TZ(prdr.start_date, '+00:00', '+09:00') BETWEEN ? AND ?
ORDER BY prdr.start_date;
`;

const searchPrdr = `
  SELECT  
    prdr.prdr_code,
    prdr.work_order_code,
    comm_name(prdr.process_type) AS process_type,
    prdr.prod_code,
    p.prod_name,
    prdr.start_date,
    prdr.end_date,
    prdr.production_qtt,
    prdr.peform_rate
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


module.exports = {
  getCurrentMonthPlans,
  searchPrdr
}