// 조건없이 전체조회 (디버그용)
const selectWKOList = `
SELECT   wko_code,
         start_date,
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
         TO_CHAR(prdp.prdp_date, 'yyyy-MM-dd') AS "prdp_date",
         TO_CHAR(prdp.start_date, 'yyyy-MM-dd') AS "start_date",
         TO_CHAR(prdp.end_date, 'yyyy-MM-dd') AS "end_date",
         TO_CHAR(prdp.due_date, 'yyyy-MM-dd') AS "due_date",
         emp.emp_name AS "reg",
         emp.emp_code,
         prdp.note
FROM     prdp_tbl prdp JOIN emp_tbl emp
                         ON prdp.reg = emp.emp_code
WHERE    prdp.end_date >= CURDATE()
ORDER BY prdp_code
`;

// EMP 목록 불러오기
const selectEMPList = `
SELECT emp.emp_code,
       emp.emp_name,
       comm_name(emp.emp_job_id) AS "emp_job",
       dept.dept_name
FROM   emp_tbl emp JOIN dept_tbl dept
                     ON emp.dept_code = dept.dept_code
WHERE  1 = 1
  AND  (? IS NULL OR ? = '' OR emp.emp_name LIKE CONCAT('%', ?, '%'))
`;

// 해당 제품이 사용 가능한 라인 목록 불러오기
const selectLineList = `
SELECT line_code,
       line_name,
       note
FROM   line_tbl
WHERE  (line_type = (
                    SELECT CASE 
                              WHEN com_value = 'j1' THEN 's1'
                              WHEN com_value IN ('j2', 'j3') THEN 's2'
                            END
                    FROM   prod_tbl
                    WHERE  prod_code = ?
                   )
   OR  prod_code = ?)
  AND  (? IS NULL OR ? = '' OR line_name LIKE CONCAT('%', ?, '%'))
`;

// 작업지시서 코드로 작업지시서 조회 - datetime 포맷 추가
const selectWKO = `
SELECT wko.wko_code,
       DATE_FORMAT(wko.start_date, '%Y-%m-%d') AS "start_date",
       wko.stat AS "stat",
       wko.note,
       wko.prdp_code,
       wko.prod_code,
       prod.prod_name,
       wko.wko_qtt,
       comm_name(prod.unit) AS "unit",
       wko.emp_code,
       emp.emp_name,
       emp2.emp_name AS "reg_name",
       TO_CHAR(wko.reg_date, 'yyyy-MM-dd') AS "reg_date",
       wko.line_code,
       line.line_name
FROM   wko_tbl wko JOIN prod_tbl prod
                     ON wko.prod_code = prod.prod_code
                   JOIN emp_tbl emp
                     ON wko.emp_code = emp.emp_code
                   JOIN emp_tbl emp2
                     ON wko.reg_code = emp2.emp_code
                   JOIN line_tbl line
                     ON wko.line_code = line.line_code
WHERE  wko.wko_code = ?
`;

// 작업지시서의 공정 목록 조회 (prod_code + prdp_code로 라인 조회 → 공정 조회)
const selectWKOProcess = `
SELECT line.line_code,
       line.line_name,
       comm_name(line.line_type) AS "line_type",
       ppd.pp_code,
       ppd.no AS "process_no",
       po.po_name AS "process_name",
       comm_name(ppd.eq_type) AS "eq_type",
       ld.eq_code,
       eq.eq_name,
       eq.eq_model,
       comm_name(eq.stat) AS "eq_stat"
FROM   line_tbl line JOIN line_d_tbl ld 
                       ON line.line_code = ld.line_code
                     JOIN prod_proc_d_tbl ppd 
                       ON ld.pp_code = ppd.pp_code
                     JOIN po_tbl po 
                       ON ppd.po_code = po.po_code
                     JOIN eq_tbl eq 
                       ON ld.eq_code = eq.eq_code
WHERE  line.line_code = ?
ORDER BY line.line_code, ppd.no, ld.line_eq_code
`;

// 제품별 생산공정 조회 (제품 추가 시 참조용)
const selectProdProcess = `
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
`;

const insertWKO = `
INSERT INTO wko_tbl(wko_code, stat, note, prdp_code, prod_code, wko_qtt, reg_date, reg_code, line_code, wko_name)
VALUES (?, 'v4', ?, ?, ?, ?, CURDATE(), ?, ?, ?)
`;

// 계획에 따른 제품 목록 조회
const selectProdListForWKO = `
SELECT prod.prod_code,
       prod.prod_name,
       prdd.planned_qtt,
       prod.note
FROM   prod_tbl prod JOIN prdp_d_tbl prdd
                       ON prod.prod_code = prdd.prod_code
                     JOIN prdp_tbl prdp
                       ON prdd.prdp_code = prdp.prdp_code
WHERE  1 = 1
  AND  (? IS NULL OR ? = '' OR prdp.prdp_code LIKE CONCAT('%', ?, '%'))
`;

// 전체 제품 목록 조회
const selectProdAll = `
SELECT prod_code,
       prod_name,
       '-' AS "planned_qtt",
       note
FROM   prod_tbl
`;

const updateWKO = `
UPDATE wko_tbl 
SET note = ?, wko_qtt = ?, wko_name = ?
WHERE wko_code = ?
`;

// 작업지시서 삭제
const deleteWKO = `
DELETE FROM wko_tbl 
WHERE wko_code = ?
`;

// 여러 조건으로 작업지시서 조회 - datetime 타입 고려
const selectWKOByOptions =  `
SELECT wko.wko_code,
       wko.wko_name,
       prod.prod_name,
       comm_name(wko.stat) AS "stat",
       DATE_FORMAT(wko.reg_date, '%Y-%m-%d') AS "reg_date",
       wko.note,
       wko.line_code,
       line.line_name
FROM   wko_tbl wko LEFT JOIN prdp_tbl prdp
                     ON wko.prdp_code = prdp.prdp_code
                   LEFT JOIN prod_tbl prod
                     ON wko.prod_code = prod.prod_code
                   LEFT JOIN line_tbl line
                     ON wko.line_code = line.line_code
WHERE 1=1
  AND (? IS NULL OR ? = '' OR wko.wko_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR wko.wko_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR ? = '' OR prod.prod_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR DATE(wko.reg_date) >= ?)
  AND (? IS NULL OR DATE(wko.reg_date) <= ?)
ORDER BY wko.reg_date DESC, wko.wko_code DESC
`;

// 최근 1달 작업지시서 조회 (팝업용) - datetime 타입 고려
const selectWKOMonth = `
SELECT wko.wko_code,
       wko.wko_name,
       prod.prod_name,
       comm_name(wko.stat) AS "stat",
       DATE_FORMAT(wko.reg_date, '%Y-%m-%d') AS "reg_date",
       wko.note,
       wko.line_code,
       line.line_name
FROM   wko_tbl wko LEFT JOIN prdp_tbl prdp
                     ON wko.prdp_code = prdp.prdp_code
                   LEFT JOIN prod_tbl prod
                     ON wko.prod_code = prod.prod_code
                   LEFT JOIN line_tbl line
                     ON wko.line_code = line.line_code
WHERE  wko.reg_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
  AND  wko.reg_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
ORDER BY wko.reg_date DESC, wko.wko_code DESC
`;

// 제목으로 제품 검색(작업지시 팝업, 계획 O)
const selectProdListForWKOByName = `
SELECT prod.prod_code,
       prod.prod_name,
       prdd.planned_qtt,
       prod.note
FROM   prod_tbl prod JOIN prdp_d_tbl prdd
                       ON prod.prod_code = prdd.prod_code
                     JOIN prdp_tbl prdp
                       ON prdd.prdp_code = prdp.prdp_code
WHERE  prdd.prdp_code = ?
AND    (? IS NULL OR ? = '' OR prod.prod_name LIKE CONCAT('%', ?, '%'))
`;

// 제목으로 제품 검색(작업지시 팝업, 계획 X)
const selectProdAllForWKOByName = `
SELECT prod_code,
       prod_name,
       '-' AS "planned_qtt",
       note
FROM   prod_tbl
WHERE  1 = 1
AND    (? IS NULL OR ? = '' OR prod_name LIKE CONCAT('%', ?, '%'))
`;

module.exports = {
    selectWKOList,
    selectPRDPList,
    selectWKO,
    selectWKOProcess,
    selectProdProcess,
    selectWKOCodeForUpdate,
    insertWKO,
    selectProdAll,
    updateWKO,
    deleteWKO,
    selectWKOByOptions,
    selectWKOMonth,
    selectEMPList,
    selectProdListForWKO,
    selectProdListForWKOByName,
    selectProdAllForWKOByName,
    selectLineList,
}