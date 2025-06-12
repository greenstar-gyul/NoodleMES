// 조건없이 전체조회
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

const selectMRPDetailList = `
SELECT   *
FROM     mrp_d_tbl
ORDER BY mrp_code
`;

const selectPRDPList = `
SELECT   prdp.prdp_code,
         prdp.prdp_name,
         TO_CHAR(prdp.prdp_date, 'yyyy-MM-dd') AS "prdp_date",
         TO_CHAR(prdp.start_date, 'yyyy-MM-dd') AS "start_date",
         TO_CHAR(prdp.end_date, 'yyyy-MM-dd') AS "end_date",
         emp.emp_name AS "reg",
         prdp.note
FROM     prdp_tbl prdp JOIN emp_tbl emp
                         ON prdp.reg = emp.emp_code
ORDER BY prdp_code;
`;

const selectMRPCode = `
SELECT mrp_code
FROM   mrp_tbl
WHERE  prdp_code = ?
`;

const selectMRP = `
SELECT mrp.mrp_code,
       mrp.plan_date,
       mrp.start_date,
       mrp.mrp_note,
       mrp.prdp_code,
       mrp.emp_code
FROM   mrp_tbl mrp
WHERE  mrp_code = ?
`;

const selectMRPDetail = `
SELECT mat.mat_name,
       mrp_d.req_qtt,
       mstock.cur_qtt,
       comm_name(mrp_d.unit) as "unit",
       mrp_d.plan_date,
       mrp_d.proposal_date,
       comm_name(mrp_d.mrp_stat) as "mrp_stat"
FROM   mrp_d_tbl mrp_d JOIN mat_tbl mat
                         ON mrp_d.mat_code = mat.mat_code
                       JOIN mat_stock_v mstock
                         ON mrp_d.mat_code = mstock.mat_code
WHERE  mrp_d.mrp_code = ?
`;

module.exports = {
    selectMRPList,
    selectMRPDetailList,
    selectPRDPList,
    selectMRPCode,
    selectMRP,
    selectMRPDetail,
}