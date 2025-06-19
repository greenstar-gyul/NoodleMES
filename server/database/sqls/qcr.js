// 품질 기준정보 목록 조회
const qcrList = `
SELECT  qcr_code,
        inspection_item,
        range_top,
        range_bot,
        unit,
        check_method,
        DATE_FORMAT(DATE_ADD(regdate, INTERVAL 9 HOUR), '%Y-%m-%d') AS regdate,
        note,
        comm_name(com_value) AS "com_value"
FROM qcr_tbl
`;

// 품질 기준정보 검색
const searchQcrList = `
SELECT  
    qcr_code,
    inspection_item,
    range_top,
    range_bot,
    unit,
    check_method,
    DATE_FORMAT(DATE_ADD(regdate, INTERVAL 9 HOUR), '%Y-%m-%d') AS regdate,
    note,
    com_value
FROM qcr_tbl
WHERE 1 = 1
  AND (? IS NULL OR qcr_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR inspection_item LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR com_value = ?)
  AND (
    (? IS NULL AND ? IS NULL)
    OR (regdate BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY))
  )
ORDER BY qcr_code;
`


// 품질 기준정보 단건 조회
const selectQcrOne = `
SELECT  qcr_code,
        inspection_item,
        range_top,
        range_bot,
        unit,
        check_method,
        regdate,
        note,
        com_value
FROM qcr_tbl
WHERE qcr_code = ?
`;

// 품질기준정보 등록 등록 
const insertQcrs = `
INSERT INTO qcr_tbl (qcr_code,
                      inspection_item,
                      range_top,
                      range_bot,
                      unit,
                      check_method,
                      regdate,
                      note,
                      com_value)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`

// 품질기준정보 코드 자동생성 쿼리
const selectQcrProdCodeForUpdate = `
SELECT CONCAT('QCR-PROD-', 
              LPAD(IFNULL(MAX(CAST(SUBSTRING(qcr_code, 10) AS UNSIGNED)), 0) + 1, 3, '0')
              ) AS new_qcr_code
FROM qcr_tbl
WHERE qcr_code LIKE 'QCR-PROD-%'
FOR UPDATE;
`;

// 품질기준정보 코드 자동생성 쿼리
const selectQcrMatCodeForUpdate = `
SELECT 
      CONCAT('QCR-MAT-', 
             LPAD(IFNULL(MAX(CAST(SUBSTRING(qcr_code, 9) AS UNSIGNED)), 0) + 1, 3, '0')
             ) AS new_qcr_code
FROM qcr_tbl
WHERE qcr_code LIKE 'QCR-MAT-%'
FOR UPDATE;
`;







module.exports = {
    qcrList,
    searchQcrList,
    selectQcrOne,
    insertQcrs,
    selectQcrProdCodeForUpdate,
    selectQcrMatCodeForUpdate
};