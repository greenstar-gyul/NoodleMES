// 조건없이 전체조회 (디버그용)
const selectWKOList = `
SELECT   wko_code,
         start_date,
         comm_name(prod_type) AS "prod_type",
         comm_name(stat) AS "stat", 
         note,
         prdp_code,
         prod_code,
         emp_code
FROM     wko_tbl
ORDER BY wko_code
`;

// 생산 계획 불러오기
const selectPRDPList = `
SELECT   prdp.prdp_code,
         prdp.prdp_name,
         prdd.prdp_d_code,
         prdd.prod_code,
         prod.prod_name,
         prdd.planned_qtt,
         TO_CHAR(prdp.due_date, 'yyyy-MM-dd') AS "due_date",
         prdp.note,
         prdd.line_code
FROM     prdp_tbl prdp LEFT JOIN prdp_d_tbl prdd
                              ON prdp.prdp_code = prdd.prdp_code
                       LEFT JOIN prod_tbl prod
                              ON prod.prod_code = prdd.prod_code
WHERE    prdp.end_date > curdate()
ORDER BY prdp_code
`;

// 작업지시서 코드로 작업지시서 조회
const selectWKO = `
SELECT wko.wko_code,
       wko.start_date,
       comm_name(wko.prod_type) AS "prod_type",
       comm_name(wko.stat) AS "stat",
       wko.note,
       wko.prdp_code,
       wko.prod_code,
       prod.prod_name,
       comm_name(prod.unit) AS "unit",
       wko.emp_code,
       emp.emp_name
FROM   wko_tbl wko JOIN prod_tbl prod
                     ON wko.prod_code = prod.prod_code
                   JOIN emp_tbl emp
                     ON wko.emp_code = emp.emp_code
WHERE  wko.wko_code = ?
`;

// 작업지시서의 공정 목록 조회 (prod_code + prdp_code로 라인 조회 → 공정 조회)
const selectWKOProcesses = `
SELECT pd.line_code,
       line.line_name,
       comm_name(line.line_type) AS "line_type",
       pd.planned_qtt,
       pd.priority,
       ppd.pp_code,
       ppd.no AS "process_no",
       po.po_name AS "process_name",
       comm_name(ppd.eq_type) AS "eq_type",
       ld.eq_code,
       eq.eq_name,
       eq.eq_model,
       comm_name(eq.stat) AS "eq_stat"
FROM   prdp_d_tbl pd 
       JOIN line_tbl line ON pd.line_code = line.line_code
       JOIN line_d_tbl ld ON line.line_code = ld.line_code
       JOIN prod_proc_d_tbl ppd ON ld.pp_code = ppd.pp_code
       JOIN po_tbl po ON ppd.po_code = po.po_code
       JOIN eq_tbl eq ON ld.eq_code = eq.eq_code
WHERE  pd.prod_code = ? 
       AND pd.prdp_code = ?
ORDER BY pd.line_code, ppd.no, ld.line_eq_code
`;

// 제품별 생산공정 조회 (제품 추가 시 참조용)
const selectProdProcesses = `
SELECT pp.prod_proc_code,
       pp.prod_code,
       prod.prod_name,
       ppd.pp_code,
       ppd.no AS "process_no",
       po.po_name AS "process_name",
       comm_name(ppd.eq_type) AS "eq_type"
FROM   prod_proc_tbl pp 
       JOIN prod_tbl prod ON pp.prod_code = prod.prod_code
       JOIN prod_proc_d_tbl ppd ON pp.prod_proc_code = ppd.prod_proc_code
       JOIN po_tbl po ON ppd.po_code = po.po_code
WHERE  pp.prod_code = ?
ORDER BY ppd.no
`;

const selectWKOCodeForUpdate = `
SELECT CONCAT(
              CONCAT('WKO-', DATE_FORMAT( CURDATE(), '%Y%m%d-')), 
              LPAD(IFNULL(MAX(SUBSTR(wko_code, -3)), 0) + 1, 3, '0')
             ) AS "wko_code"
FROM wko_tbl
WHERE SUBSTR(wko_code, 5, 8) = DATE_FORMAT( CURDATE(), '%Y%m%d')
FOR UPDATE
`

const insertWKO = `
INSERT INTO wko_tbl(wko_code, start_date, prod_type, stat, note, prdp_code, prod_code, emp_code)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`

// 전체 제품 목록 조회
const selectProdAll = `
SELECT prod.prod_code,
       prod.prod_name,
       comm_name(prod.unit) AS "unit",
       prod.note,
       prod.prod_type
FROM   prod_tbl prod
WHERE  comm_name(prod.is_used) = '사용'
ORDER BY prod_code
`;

const updateWKO = `
UPDATE wko_tbl 
SET start_date = ?, prod_type = ?, stat = ?, note = ?
WHERE wko_code = ?
`;

// 작업지시서 삭제
const deleteWKO = `
DELETE FROM wko_tbl 
WHERE wko_code = ?
`;

// 여러 조건으로 작업지시서 조회
const selectWKOByOptions =  `
SELECT wko.wko_code,
       prdp.prdp_code,
       prdp.prdp_name,
       prod.prod_name,
       comm_name(wko.prod_type) AS "prod_type",
       comm_name(wko.stat) AS "stat",
       wko.start_date,
       wko.note
FROM   wko_tbl wko JOIN prdp_tbl prdp
                     ON wko.prdp_code = prdp.prdp_code
                   JOIN prod_tbl prod
                     ON wko.prod_code = prod.prod_code
WHERE 1=1
  AND (? IS NULL OR wko.wko_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR prdp.prdp_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR prdp.prdp_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR prod.prod_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR wko.start_date >= ?)
  AND (? IS NULL OR wko.start_date <= ?)
ORDER BY wko.wko_code
`;

// 최근 1달 작업지시서 조회
const selectWKOMonth = `
SELECT wko.wko_code,
       prdp.prdp_code,
       prdp.prdp_name,
       prod.prod_name,
       comm_name(wko.prod_type) AS "prod_type",
       comm_name(wko.stat) AS "stat",
       wko.start_date,
       wko.note
FROM   wko_tbl wko JOIN prdp_tbl prdp
                     ON wko.prdp_code = prdp.prdp_code
                   JOIN prod_tbl prod
                     ON wko.prod_code = prod.prod_code
WHERE YEAR(wko.start_date) = YEAR(CURDATE())
  AND MONTH(wko.start_date) = MONTH(CURDATE())
ORDER BY wko.wko_code
`;

module.exports = {
    selectWKOList,
    selectPRDPList,
    selectWKO,
    selectWKOProcesses,
    selectProdProcesses,
    selectWKOCodeForUpdate,
    insertWKO,
    selectProdAll,
    updateWKO,
    deleteWKO,
    selectWKOByOptions,
    selectWKOMonth,
};