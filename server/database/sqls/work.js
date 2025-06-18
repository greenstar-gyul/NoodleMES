
// 작업진행 목록 조회 (작업완료 제외)
const getCurrentMonthPlan = `
SELECT  w.wko_code,
        w.prod_code,
        p.prod_name,
        w.wko_qtt,
        comm_name(w.stat) AS "stat",
        w.reg_date,
        w.start_date,
        w.end_date,
        w.line_code
FROM    wko_tbl w
LEFT JOIN prod_tbl p ON w.prod_code = p.prod_code
WHERE CONVERT_TZ(w.reg_date, '+00:00', '+09:00') BETWEEN ? AND ?
  AND w.stat != 'v2'  -- ✅ 작업완료 제외 조건 추가
ORDER BY w.wko_code;
`;

// 작업 지시서 코드를 바탕으로 작업진행 조회
// const selectWKOProcesses = `
// SELECT w.wko_code,
//        w.emp_code,
//        w.prod_code,
//        w.line_code,
//        w.wko_qtt,
//        ld.line_eq_code,
//        ld.pp_code,
//        eq.eq_code,
//        eq.eq_name,
//        ppd.eq_type,
//        po.po_code,
//        po.po_name,
//        prdr.prdr_code,
//        prdd.prdr_d_code,
//        prdd.proc_rate,
//        prdd.start_date,
//        prdd.end_date,
//        prdd.input_qtt,
//        prdd.def_qtt,
//        prdd.make_qtt
// FROM   wko_tbl w LEFT JOIN line_tbl l
//                         ON w.line_code = l.line_code
//                  LEFT JOIN line_d_tbl ld
//                         ON l.line_code = ld.line_code
//                  LEFT JOIN prod_proc_d_tbl ppd
//                         ON ld.pp_code = ppd.pp_code
//                  LEFT JOIN prdr_tbl prdr
//                         ON w.wko_code = prdr.work_order_code
//                  LEFT JOIN prdr_d_tbl prdd
//                  		ON ld.line_eq_code = prdd.line_eq_code
//                  LEFT JOIN po_tbl po
//                  		ON po.po_code = ppd.po_code
//                  LEFT JOIN eq_tbl eq
//                  		ON eq.eq_code = ld.eq_code
const selectWKOProcesses = `
SELECT *
FROM   processes_v
WHERE  wko_code = ?
`;

// PRDR 코드 생성
const selectPRDRCodeForUpdate = `
SELECT CONCAT('PRDR-', LPAD(IFNULL(MAX(SUBSTR(prdr_code, -3)), 0) + 1, 3, '0')) AS "prdr_code"
FROM prdr_tbl
FOR UPDATE
`;

// PRDR 저장
const insertPRDR = `
INSERT INTO prdr_tbl(prdr_code, start_date, end_date, total_time, note, production_qtt, work_order_code, emp_code, prod_code, perform_rate)
VALUES(?, NULL, NULL, NULL, ?, ?, ?, ?, ?, NULL)
`

// PRDR-D 코드 생성
const selectPRDRDCode = `
SELECT CONCAT('PRDR-D-', LPAD(IFNULL(MAX(SUBSTR(prdr_d_code, -3)), 0) + 1, 3, '0')) AS "prdr_d_code"
FROM prdr_d_tbl
`;

// 작업진행 조건 검색
const searchWorkingList = `
SELECT  w.wko_code,
        w.prod_code,
        p.prod_name,
        w.wko_qtt,
        comm_name(w.stat) AS "stat",
        w.reg_date,
        w.start_date,
        w.end_date,
        w.line_code
FROM    wko_tbl w
LEFT JOIN prod_tbl p ON w.prod_code = p.prod_code
WHERE 1 = 1
  AND w.stat != 'v2'  -- 작업완료 제외
  AND (? IS NULL OR w.wko_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR p.prod_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR w.line_code LIKE CONCAT('%', ?, '%'))
  AND (
    (? IS NULL OR ? IS NULL)
    OR CONVERT_TZ(w.reg_date, '+00:00', '+09:00') BETWEEN ? AND ?
  )
ORDER BY w.wko_code;
`;

// 작업진행 상세 단건 조회
const selectWorkDetailOne = `
SELECT  v.po_name,
        v.eq_name,
        v.prod_code,
        p.prod_name,
        v.wko_code,
        v.line_code,
        v.start_date,
        v.end_date,
        v.end_date - v.start_date AS "total_time",
        v.input_qtt,
        v.wko_qtt,
        v.make_qtt,
        v.def_qtt,
        (v.make_qtt / v.wko_qtt) * 100 AS "perform_rate"
FROM   processes_v v
LEFT JOIN prod_tbl p ON v.prod_code = p.prod_code
WHERE v.wko_code = ? AND v.eq_code = ?
`;

// 상세에 맞는 설비 들고오는 쿼리
const selectEquipmentList= `
SELECT eq.eq_code, eq.eq_name
FROM line_d_tbl ld
JOIN eq_tbl eq ON ld.eq_code = eq.eq_code
WHERE ld.line_code = ?
ORDER BY eq.eq_code;
`;

// 작업지시서 코드로 라인 상세 조회
const selectLineDetailList = `
SELECT ld.line_eq_code
FROM   line_d_tbl ld JOIN wko_tbl w
					   ON w.line_code = ld.line_code
WHERE  w.wko_code = ?
`;

// 작업 진행 상세 저장
const insertPRDRD = `
INSERT INTO prdr_d_tbl(prdr_d_code, prdr_code, line_eq_code)
VALUES(?, ?, ?)
`

// 작업지시서 코드와 설비 코드로 PRDR-D 코드 조회
const selectPrdrDCodeForDetail = `
SELECT prdr_d_code 
FROM processes_v
WHERE wko_code = ? AND eq_code = ?
`;

module.exports = {
  selectPRDRCodeForUpdate,
  insertPRDR,
  getCurrentMonthPlan,
  searchWorkingList,
  selectWKOProcesses,
  selectWorkDetailOne,
  selectEquipmentList,
  selectPRDRDCode,
  selectLineDetailList,
  insertPRDRD,
  selectPrdrDCodeForDetail,
}