const BASE_QUERY = `
SELECT
  a.qio_code,
  a.qio_date,
  a.insp_date,
  IFNULL(a.prdr_code, '해당없음') AS prdr_code,
  IFNULL(a.purchase_code, '해당없음') AS purchase_code,
  b.emp_name
FROM qio_tbl as a
JOIN emp_tbl as b ON a.emp_code = b.emp_code
`;

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

//
const selectQcrList =
    `SELECT
    qcr_code,
    inspection_item,
    range_top,
    range_bot,
    unit,
    check_method,
    regdate,
    note
FROM
    qcr_tbl
WHERE    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`;

//
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

const selectPrdrByQioCode = `
SELECT p.prdr_code
       ,o.po_name
       ,mp.purchase_code
       ,prod.prod_name
       ,p.production_qtt
FROM qio_tbl q
JOIN prdr_tbl p ON q.prdr_code = p.prdr_code
JOIN po_tbl o ON q.po_code = o.po_code
JOIN prod_tbl prod ON p.prod_code = prod.prod_code
JOIN mpo_tbl mp ON q.purchase_code = mp.purchase_code
WHERE q.qio_code = ?
`

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
    com_value
) VALUES (?, ?, ?, ?, ?, ?, ?, IFNULL(?, curdate()), ?);
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

// eq_ma_tbl의 PK, eq_ma_code 자동생성
// EQMA-20250515-001
const selectQioCodeForUpdate = `
SELECT CONCAT(
    'QIO-', 
    DATE_FORMAT(NOW(), '%Y%m%d'), '-', 
    LPAD(COALESCE(MAX(SUBSTR(qio_code, -3)), 0) + 1, 3, '0')
) AS next_qio_code
FROM qio_tbl
WHERE qio_code LIKE CONCAT('QIO-', DATE_FORMAT(NOW(), '%Y%m%d'), '-%')
FOR UPDATE
`;

module.exports = {
    getQioList: BASE_QUERY + ' ORDER BY qio_code',
    searchQioListByCode: BASE_QUERY + ' WHERE a.qio_code = ?',
    fetchOrders,
    selectList,
    insertQcr,
    selectQcrcodeProd,
    selectQcrCodeMat,
    selectPrdrByQioCode,
    selectQioCodeForUpdate: selectQioCodeForUpdate,
}