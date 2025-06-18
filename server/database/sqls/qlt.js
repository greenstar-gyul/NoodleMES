// 주문 전체 조회 품질검사목록
const fetchOrders =
`SELECT 
    qio.qio_code,
    qio.prod_code,
    qio.qio_date,
    qio.emp_code,
    qio.note
FROM 
    qio_tbl qio
JOIN 
    qio_tbl qio ON qio.qio_code = qio.qio_code
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

// const selectQualityStandards = `
// SELECT 
//     qcr_code,
//     po_code,
//     inspection_item,
//     check_method
// FROM quality_std_tbl
// WHERE 1=1
//     AND (? IS NULL OR qcr_code LIKE CONCAT('%', ?, '%'))
//     AND (? IS NULL OR po_code LIKE CONCAT('%', ?, '%'))
//     AND (? IS NULL OR inspection_item LIKE CONCAT('%', ?, '%'))
//     AND (? IS NULL OR check_method = ?)
// ORDER BY qcr_code;
// `;

// 기준정보 등록
const insertQcr = `
INSERT INTO qcr_tbl (
    qcr_code,
    inspection_item,
    range_top,
    range_bot,
    unit,
    note,
    check_method,
    regdate,
    com_value,
    is_used
) VALUES (?, ?, ?, ?, ?, ?, ?, IFNULL(?, curdate()), ?, ?);
`;

// 제품검사 품질기준코드
const selectQcrcodeProd = `
SELECT CONCAT(
    'QCR-PROD-',
    LPAD(IFNULL(MAX(CAST(SUBSTRING(qcr_code, 10) AS UNSIGNED)), 0) + 1, 3, '0')
)
FROM qcr_tbl
WHERE qcr_code LIKE 'QCR-PROD-%'
FOR UPDATE
`;

// 자재검사 품질기준코드
const selectQcrCodeMat = `
SELECT CONCAT(
    'QCR-MAT-',
    LPAD(IFNULL(MAX(CAST(SUBSTRING(qcr_code, 9) AS UNSIGNED)), 0) + 1, 3, '0')
)
FROM qcr_tbl 
WHERE qcr_code LIKE 'QCR-MAT-%'
FOR UPDATE`
;


module.exports = {
    fetchOrders,
    selectList,
    insertQcr,
    selectQcrcodeProd,
    selectQcrCodeMat
}