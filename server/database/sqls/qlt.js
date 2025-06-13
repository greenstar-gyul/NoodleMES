// 주문 전체 조회 품질검사목록
const selectAll =
`SELECT 
    qio.qio_code,
    qio.prod_code,
    qio.qio_date,
    qio.emp_code,
    qi.note
FROM 
    qio_tbl qio
JOIN 
    qi_tbl qi ON qio.qi_code = qi.qi_code
`;

const selectList =
`SELECT
    qio.qio_code,
    qio.prod_name,
    qio.qio_date,
    qio.emp_code,
    qi.note
FROM
    qio_tbl qio
JOIN
    qio_tbl qi ON qio.qi_code = qi.qi_code
WHERE 1=1
    AND (? IS NULL OR qio_code LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR prod_name LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR qio_date >= ?)
    AND (? IS NULL OR emp_code LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR note LIKE CONCAT('%', ?, '%'))
ORDER BY prdp_date;
`;


module.exports = {
    selectList,
    selectAll
}