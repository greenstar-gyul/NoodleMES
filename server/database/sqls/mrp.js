// 조건없이 전체조회 (디버그용)
const selectMRPList = `
SELECT   mrp_code,
         plan_date,
         start_date,
         mrp_note,
         prdp_code,
         emp_code
FROM     mrp_tbl
ORDER BY mrp_code
`;

// 조건없이 전체 상세 조회 (디버그용)
const selectMRPDetailList = `
SELECT   *
FROM     mrp_d_tbl
ORDER BY mrp_code
`;

// 생산 계획 불러오기
const selectPRDPList = `
SELECT   prdp.prdp_code,
         prdp.prdp_name,
         TO_CHAR(prdp.prdp_date, 'yyyy-MM-dd') AS "prdp_date",
         TO_CHAR(prdp.start_date, 'yyyy-MM-dd') AS "start_date",
         TO_CHAR(prdp.end_date, 'yyyy-MM-dd') AS "end_date",
         emp.emp_name AS "reg",
         emp.emp_code,
         prdp.note
FROM     prdp_tbl prdp JOIN emp_tbl emp
                         ON prdp.reg = emp.emp_code
ORDER BY prdp_code;
`;

// 생산 계회의 MRP 코드 불러오기
const selectMRPCode = `
SELECT mrp_code
FROM   mrp_tbl
WHERE  prdp_code = ?
`;

// MRP 코드로 MRP 조회
const selectMRP = `
SELECT mrp_code,
       plan_date,
       start_date,
       mrp_note,
       prdp_code,
       emp_code
FROM   mrp_tbl
WHERE  mrp_code = ?
`;

// const selectMRPDetail = `
// SELECT mat.mat_name,
//        mrp_d.req_qtt,
//        mstock.cur_qtt,
//        comm_name(mrp_d.unit) as "unit",
//        mrp_d.plan_date,
//        mrp_d.proposal_date,
//        comm_name(mrp_d.mrp_stat) as "mrp_stat"
// FROM   mrp_d_tbl mrp_d JOIN mat_tbl mat
//                          ON mrp_d.mat_code = mat.mat_code
//                        JOIN mat_stock_v mstock
//                          ON mrp_d.mat_code = mstock.mat_code
// WHERE  mrp_d.mrp_code = ?
// `;

// MRP 코드로 MRP 상세 조회
const selectMRPDetail = `
SELECT mrp_d.mrp_code,
       mrp_d.mrp_d_code,
       mat.mat_name,
       mrp_d.req_qtt,
       comm_name(mrp_d.unit) as "unit",
       mstock.cur_qtt,
       comm_name(mstock.unit) as "stock_unit"
FROM   mrp_d_tbl mrp_d JOIN mat_tbl mat
                         ON mrp_d.mat_code = mat.mat_code
                       JOIN mat_stock_v mstock
                         ON mrp_d.mat_code = mstock.mat_code
WHERE  mrp_d.mrp_code = ?
`;

const selectMRPCodeForUpdate = `
SELECT CONCAT(
              CONCAT('MRP-', DATE_FORMAT( CURDATE(), '%Y%m%d-')), 
              LPAD(IFNULL(MAX(SUBSTR(mrp_code, -3)), 0) + 1, 3, '0')
             ) AS "mrp_code"
FROM mrp_tbl
WHERE SUBSTR(mrp_code, 5, 8) = DATE_FORMAT( CURDATE(), '%Y%m%d')
FOR UPDATE
`

const selectMRPDetailCode = `
SELECT CONCAT(
              'MRP-D-',
              LPAD(IFNULL(MAX(SUBSTR(mrp_d_code, -4)), 0) + 1, 4, '0')
             ) AS "mrp_d_code"
FROM mrp_d_tbl
`

const insertMRP = `
INSERT INTO mrp_tbl(mrp_code, plan_date, start_date, mrp_note, prdp_code, emp_code)
VALUES (?, ?, ?, ?, ?, ?)
`

const insertMRPDetail = `
INSERT INTO mrp_d_tbl(mrp_d_code, unit, req_qtt, mrp_code, mat_code)
VALUES (?, ?, ?, ?, ?)
`

const selectBOMbyprdpcode = `
SELECT   bm.mat_code,
         bm.mat_name,
         SUM(bm.req_qtt * pd.planned_qtt) AS "req_qtt",
         comm_name(bm.unit) AS "unit",
         mstock.cur_qtt,
         comm_name(mstock.unit) AS "stock_unit"
FROM     bom_mat bm JOIN bom_tbl bt 
                      ON bm.bom_code = bt.bom_code
                    JOIN prdp_d_tbl pd 
                      ON bt.prod_code = pd.prod_code
                    JOIN mat_stock_v mstock 
                      ON bm.mat_code = mstock.mat_code
WHERE    pd.prdp_code = ?
GROUP BY bm.mat_code, bm.mat_name, mstock.cur_qtt, unit
`;

const selectMatAlll = `
SELECT mat.mat_code,
       mat.mat_name,
       comm_name(mat.unit) AS "unit",
       mat.note,
       comm_name(mat.material_type_code) AS "mat_type",
       mstock.cur_qtt,
       comm_name(mstock.unit) AS "stock_unit"
FROM   mat_tbl mat JOIN mat_stock_v mstock
                     ON mat.mat_code = mstock.mat_code
ORDER BY mat_code
`;

const updateMRP = `
UPDATE mrp_tbl 
SET mrp_note = ?
WHERE mrp_code = ?
`;

const updateMRPDetail = `
UPDATE mrp_d_tbl 
SET req_qtt = ?
WHERE mrp_d_code = ?
`;

const selectMRPByOptions =  `
SELECT mrp.mrp_code,
       prdp.prdp_code,
       prdp.prdp_name,
       mat.mat_name,
       mrd.req_qtt,
       comm_name(mrd.unit) "unit",
       mrp.plan_date,
       mrp.mrp_note
FROM   mrp_tbl mrp LEFT JOIN mrp_d_tbl mrd
                          ON mrp.mrp_code = mrd.mrp_code
                   LEFT JOIN prdp_tbl prdp
                          ON mrp.prdp_code = prdp.prdp_code
                   LEFT JOIN mat_tbl mat
                          ON mat.mat_code = mrd.mat_code
WHERE 1=1
  AND (? IS NULL OR mrp.mrp_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR prdp.prdp_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR prdp.prdp_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR mat.mat_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR mrp.plan_date >= ?)
  AND (? IS NULL OR mrp.plan_date <= ?)
ORDER BY mrp.mrp_code
`;

// 오늘날짜를 기준으로 해당하는 달에 내용만 조회
const selectMRPMonth = `
SELECT mrp.mrp_code,
       prdp.prdp_code,
       prdp.prdp_name,
       mat.mat_name,
       mrd.req_qtt,
       comm_name(mrd.unit) "unit",
       mrp.plan_date,
       mrp.mrp_note
FROM   mrp_tbl mrp LEFT JOIN mrp_d_tbl mrd
                          ON mrp.mrp_code = mrd.mrp_code
                   LEFT JOIN prdp_tbl prdp
                          ON mrp.prdp_code = prdp.prdp_code
                   LEFT JOIN mat_tbl mat
                          ON mat.mat_code = mrd.mat_code
WHERE YEAR(mrp.plan_date) = YEAR(CURDATE())
  AND MONTH(mrp.plan_date) = MONTH(CURDATE())
ORDER BY 1
`;

module.exports = {
    selectMRPList,
    selectMRPDetailList,
    selectPRDPList,
    selectMRPCode,
    selectMRP,
    selectMRPDetail,
    selectMRPCodeForUpdate,
    selectMRPDetailCode,
    insertMRP,
    insertMRPDetail,
    selectBOMbyprdpcode,
    selectMatAlll,
    updateMRP,
    updateMRPDetail,
    selectMRPByOptions,
    selectMRPMonth,
}