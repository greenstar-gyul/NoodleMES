const BASE_QUERY = `
SELECT
  a.qio_code,
  a.qio_date,
  a.insp_date,
  IFNULL(a.prdr_code, '해당없음') AS prdr_code,
  IFNULL(a.mpr_d_code, '해당없음') AS mpr_d_code,
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
const selectList = `
SELECT
  a.qio_code,
  a.qio_date,
  a.insp_date,
  IFNULL(a.prdr_code, '해당없음') AS prdr_code,
  IFNULL(a.mpr_d_code, '해당없음') AS mpr_d_code,
  b.emp_name
FROM qio_tbl as a
JOIN emp_tbl as b ON a.emp_code = b.emp_code
WHERE 1=1
    AND (? IS NULL OR a.qio_code LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR a.qio_date >= ?)
    AND (? IS NULL OR a.qio_date <= ?)
    AND (? IS NULL OR a.insp_date >= ?)
    AND (? IS NULL OR a.insp_date <= ?)
    AND (? IS NULL OR a.prdr_code LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR a.mpr_d_code LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR b.emp_name LIKE CONCAT('%', ?, '%'))
ORDER BY a.qio_date DESC;
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
SELECT q.qio_code,
       q.prdr_code,
       o.po_name,
       p.end_date,
       prod.prod_name,
       p.production_qtt
FROM qio_tbl q
LEFT JOIN prdr_tbl p ON q.prdr_code = p.prdr_code
LEFT JOIN po_tbl o ON q.po_code = o.po_code  
LEFT JOIN prod_tbl prod ON p.prod_code = prod.prod_code
WHERE q.qio_code = ?
`;
const selectMprByQioCode = `
SELECT q.qio_code,
       md.mpr_code,
       md.mpr_d_code,
       m.deadline,
       mat.mat_name,
       md.req_qtt
FROM qio_tbl q
JOIN mpr_d_tbl md ON q.mpr_d_code = md.mpr_d_code
LEFT JOIN mat_tbl mat ON md.mat_code = mat.mat_code
LEFT JOIN mpr_tbl m ON md.mpr_code = m.mpr_code
WHERE q.qio_code = ?;
`;

const getQcrForPopup = `
SELECT
    qcr_code,
    inspection_item,
    check_method
FROM qcr_tbl
`;

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

const insertQio = `
INSERT INTO qio_tbl (
    qio_code
    ,qio_date
    ,insp_date
    ,prdr_code
    ,po_code
    ,mpr_d_code
    ,emp_code
) VALUES (?, ?, ?, ?, (SELECT po_code FROM po_tbl WHERE po_name = ?), ?, (SELECT emp_code FROM emp_tbl WHERE emp_name = ?));
`;


const updateQio = `
UPDATE qio_tbl
SET 
    qio_date = ?,
    insp_date = ?,
    prdr_code = ?,
    po_code = (SELECT po_code FROM po_tbl WHERE po_name = ?),
    mpr_d_code = ?,
    emp_code = (SELECT emp_code FROM emp_tbl WHERE emp_name = ?)
WHERE 
    qio_code = ?;
`;

const deleteQio = `
DELETE FROM qio_tbl
WHERE 
    qio_code = ?;
`;

const selectQir = `
SELECT 
    q.qir_code,
    q.start_date,
    q.end_date,
    q.unpass_qtt,
    q.pass_qtt,
    q.unpass_rate,
    q.result,
    q.note,
    q.qio_code,
    q.qir_emp_code,
    (SELECT emp_name FROM emp_tbl WHERE emp_code = q.qir_emp_code) AS qir_emp_name,
    qc.inspection_item,
    q.qcr_code
FROM qir_tbl AS q
JOIN emp_tbl AS e ON q.qir_emp_code = e.emp_code
JOIN qcr_tbl AS qc ON q.qcr_code = qc.qcr_code
WHERE q.qir_code = ?
`;

const insertQir = `
INSERT INTO qir_tbl (
    qir_code,
    start_date,
    end_date,
    unpass_qtt,
    pass_qtt,
    unpass_rate,
    result,
    note,
    qio_code,
    qir_emp_code,
    qcr_code
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?,
    CASE 
        WHEN ? IS NULL THEN (SELECT emp_code FROM emp_tbl WHERE emp_name = ?)
        ELSE ?
    END,
    (SELECT qcr_code FROM qcr_tbl WHERE inspection_item = ?)
);
`;

const updateQir = `
UPDATE qir_tbl
SET 
    start_date = ?,
    end_date = ?,
    unpass_qtt = ?,
    pass_qtt = ?,
    unpass_rate = ?,
    result = ?,
    note = ?,
    qio_code = ?,
    qir_emp_code = CASE 
        WHEN ? IS NULL THEN (SELECT emp_code FROM emp_tbl WHERE emp_name = ?)
        ELSE ?
    END,
    qcr_code = (SELECT qcr_code FROM qcr_tbl WHERE inspection_item = ?)
WHERE 
    qir_code = ?;
`;

const deleteQir = `
DELETE FROM qir_tbl
WHERE 
    qir_code = ?;
`;

//QIR-001->qir_code
const selectQirCodeForUpdate = `
SELECT CONCAT(
    'QIR-',
    LPAD(IFNULL(MAX(CAST(SUBSTRING(qir_code, 5) AS UNSIGNED)), 0) + 1, 3, '0')
) AS next_qir_code
FROM qir_tbl
WHERE qir_code LIKE 'QIR-%'
FOR UPDATE
`;

// 완제품 LOT 번호 생성
const selectLotNumForUpdateThree =
`
SELECT CONCAT('LOT-400-', 
           DATE_FORMAT(CURDATE(), '%Y%m%d'), '-', LPAD( IFNULL(MAX(SUBSTRING(lot_num, -3)), 0) + 1, 3,'0' )
       ) AS next_lot_num
FROM lot_tbl  
WHERE SUBSTRING(lot_num, 9, 8) = DATE_FORMAT(CURDATE(), '%Y%m%d')
FOR UPDATE;
`;

//IN-20250610-0001 -> pinbnd_code
const selectPinbndCodeForUpdate = `
SELECT CONCAT(
    'IN-',
    DATE_FORMAT(NOW(), '%Y%m%d'), '-',
    LPAD(COALESCE(MAX(SUBSTR(pinbnd_code, -4)), 0) + 1, 4, '0')
) AS next_pinbnd_code
FROM pinbnd_tbl
WHERE pinbnd_code LIKE CONCAT('IN-', DATE_FORMAT(NOW(), '%Y%m%d'), '-%')
FOR UPDATE;
`;

const insertPinbnd = `
INSERT INTO pinbnd_tbl (
    pinbnd_code,
    qtt,
    pinbnd_date,
    note,
    qir_code,
    mcode,
    prod_code,
    lot_num)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`;

const insertLot = `
INSERT INTO lot_tbl (
    lot_num,
    issdate,
    item_type_code,
    prod_code)
    VALUES (?, ?, 'i1', ?);
`;

const selectSimpleQir = `
SELECT qir.qir_code,
        qir.result,
        qc.inspection_item,
        qio.qio_date
FROM qir_tbl AS qir
JOIN qio_tbl AS qio ON qir.qio_code = qio.qio_code
JOIN qcr_tbl AS qc ON qir.qcr_code = qc.qcr_code
`;

const selectQirCodesByQioCode = `
SELECT qir_code
FROM qir_tbl
WHERE qio_code = ?
`;

const selectSimpleQirByQioCode = `
SELECT qir.qir_code,
        qir.result,
        qio.qio_date,
        qir.start_date,
        qir.end_date,
        qir.unpass_qtt,
        qir.pass_qtt,
        qir.unpass_rate,
        qir.qir_emp_code,
        qir.qcr_code,
        qc.inspection_item,
        qir.note
FROM qir_tbl AS qir
JOIN qio_tbl AS qio ON qir.qio_code = qio.qio_code
JOIN qcr_tbl AS qc ON qir.qcr_code = qc.qcr_code
WHERE qir.qio_code = ?
`;

const selectQirByQioCode = `
SELECT 
    q.qir_code,
    q.start_date,
    q.end_date,
    q.unpass_qtt,
    q.pass_qtt,
    q.unpass_rate,
    q.result,
    q.note,
    q.qio_code,
    e.emp_name AS qir_emp_name,
    qc.inspection_item
FROM qir_tbl AS q
JOIN emp_tbl AS e ON q.qir_emp_code = e.emp_code
LEFT JOIN qcr_tbl AS qc ON q.qcr_code = qc.qcr_code
WHERE q.qio_code = ?
ORDER BY q.qir_code DESC
`; 7

// ✅ QIO 목록 조회용 (팝업에서 사용)
const getQioListForPopup = `
SELECT 
    a.qio_code,
    a.qio_date,
    a.insp_date,
    IFNULL(a.prdr_code, '해당없음') AS prdr_code,
    IFNULL(a.purchase_code, '해당없음') AS purchase_code,
    b.emp_name,
    p.po_name,
    prod.prod_name
FROM qio_tbl as a
JOIN emp_tbl as b ON a.emp_code = b.emp_code
LEFT JOIN po_tbl p ON a.po_code = p.po_code
LEFT JOIN prdr_tbl pr ON a.prdr_code = pr.prdr_code
LEFT JOIN prod_tbl prod ON pr.prod_code = prod.prod_code
ORDER BY a.qio_date DESC, a.qio_code DESC
`;

const getProdCodeByName = `
SELECT prod_code
FROM prod_tbl
WHERE prod_name = ?
`;

const getEmpCodeByQirEmpCode = `
SELECT emp_code
FROM emp_tbl
WHERE emp_name = ?
`;

module.exports = {
    getQioList: BASE_QUERY + ' ORDER BY a.qio_date DESC',
    searchQioListByCode: BASE_QUERY + ' WHERE a.qio_code = ?',
    fetchOrders,
    selectList,
    selectQcrList,
    selectPrdrByQioCode,
    selectQir,
    insertQir,
    updateQir,
    deleteQir,
    insertQcr,
    insertQio,
    updateQio,
    deleteQio,
    selectQirByQioCode,
    selectQirCodeForUpdate,
    getQioListForPopup,
    selectQcrcodeProd,
    selectQcrCodeMat,
    selectPrdrByQioCode,
    selectMprByQioCode,
    selectSimpleQir,
    selectLotNumForUpdateThree,
    selectPinbndCodeForUpdate,
    insertPinbnd,
    selectSimpleQirByQioCode,
    selectQirCodesByQioCode,
    getProdCodeByName,
    getEmpCodeByQirEmpCode,
    getProdCodeByName,
    selectQcrForPopup: getQcrForPopup,
    selectQir,
    selectQioCodeForUpdate: selectQioCodeForUpdate,
    selectQirCodeForUpdate: selectQirCodeForUpdate,
    insertLot
}