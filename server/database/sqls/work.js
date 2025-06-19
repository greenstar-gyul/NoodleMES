
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
//        ppd.no,
//        NULL AS prdr_code,          -- 아직 생성 전
//        NULL AS prdr_d_code,        -- 아직 생성 전
//        0 AS proc_rate,             -- 기본값 0
//        NULL AS start_date,
//        NULL AS end_date,
//        NULL AS input_qtt,
//        NULL AS def_qtt,
//        NULL AS make_qtt
// FROM   wko_tbl w 
//        LEFT JOIN line_tbl l ON w.line_code = l.line_code
//        LEFT JOIN line_d_tbl ld ON l.line_code = ld.line_code
//        LEFT JOIN prod_proc_d_tbl ppd ON ld.pp_code = ppd.pp_code
//        LEFT JOIN po_tbl po ON po.po_code = ppd.po_code
//        LEFT JOIN eq_tbl eq ON eq.eq_code = ld.eq_code
// WHERE w.wko_code = ?
// ORDER BY ppd.no
const selectWKOProcesses = `
SELECT  wko_code,
        emp_code,
        prod_code,
        line_code,
        wko_qtt,
        line_eq_code,
        pp_code,
        eq_code,
        eq_name,
        eq_type,
        po_code,
        po_name,
        prdr_code,
        prdr_d_code,
        proc_rate,
        start_date,
        end_date,
        input_qtt,
        def_qtt,
        make_qtt
FROM   processes_v
WHERE  wko_code = ?
ORDER BY pp_code
`;

// PRDR 코드 생성
const selectPRDRCodeForUpdate = `
SELECT CONCAT('PRDR-', LPAD(IFNULL(MAX(SUBSTR(prdr_code, -3)), 0) + 1, 3, '0')) AS "prdr_code"
FROM prdr_tbl
FOR UPDATE
`;

// PRDR 저장
const insertPRDR = `
INSERT INTO prdr_tbl(prdr_code, start_date, note, ord_qtt, work_order_code, emp_code, prod_code)
VALUES(?, NOW(), ?, ?, ?, ?, ?)
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
SELECT  COALESCE(v.po_name, '미설정') AS po_name,
        COALESCE(v.eq_name, '미설정') AS eq_name,
        v.prod_code,
        p.prod_name,
        v.wko_code,
        v.line_code,
        v.start_date,
        v.end_date,
        CASE 
          WHEN v.end_date IS NOT NULL AND v.start_date IS NOT NULL 
          THEN v.end_date - v.start_date 
          ELSE NULL 
        END AS "total_time",
        COALESCE(v.input_qtt, 0) AS input_qtt,
        v.wko_qtt,
        COALESCE(v.make_qtt, 0) AS make_qtt,
        COALESCE(v.def_qtt, 0) AS def_qtt,
        CASE 
          WHEN v.make_qtt > 0 AND v.wko_qtt > 0 
          THEN (v.make_qtt / v.wko_qtt) * 100 
          ELSE 0 
        END AS "perform_rate"
FROM   processes_v v  -- ✅ 기존 뷰 사용
LEFT JOIN prod_tbl p ON v.prod_code = p.prod_code
WHERE v.wko_code = ? AND v.eq_code = ?
`;

// 상세에 맞는 현재 사용설비가저오는 쿼리
const selectWkocodeEqList = `
SELECT  eq_code,
        eq_name
FROM    processes_v
WHERE   wko_code = ?
ORDER BY pp_code;
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
`

// prdr_code로 작업지시서 공정 조회
const selectPrdrDCodeByWkoCode = `
SELECT prdr_d_code
FROM prdr_d_tbl
WHERE prdr_code = ?
`;


// 자재 출고 코드 생성
const selectMoutbndCode = `
SELECT CONCAT(
              CONCAT('MOUT-', DATE_FORMAT( CURDATE(), '%Y%m%d-')), 
              LPAD(IFNULL(MAX(SUBSTR(moutbnd_code, -3)), 0) + 1, 3, '0')
             ) AS "moutbnd_code"
FROM moutbnd_tbl
WHERE SUBSTR(moutbnd_code, 5, 8) = DATE_FORMAT( CURDATE(), '%Y%m%d')
`

// 자재 재고 상태 파악 용 자재 재고 조회
const selectMaterialListForPRDR = `
SELECT   bm.mat_code,
         bm.mat_name,
        --  SUM(bm.req_qtt * prdr.ord_qtt) AS "req_qtt",
        --  comm_name(bm.unit) AS "unit",
         
         CASE
            WHEN bm.unit = 'h6' THEN ROUND(SUM(bm.req_qtt * prdr.ord_qtt / 1000), 2)
            WHEN bm.unit = 'h1' THEN ROUND(SUM(bm.req_qtt * prdr.ord_qtt), 2)
            WHEN bm.unit = 'h2' THEN ROUND(SUM(bm.req_qtt * prdr.ord_qtt * 1000), 2)
            WHEN bm.unit = 'h3' THEN ROUND(SUM(bm.req_qtt * prdr.ord_qtt / 1000), 2)
            WHEN bm.unit = 'hc' THEN ROUND(SUM(bm.req_qtt * prdr.ord_qtt / 1000000), 2)
            WHEN bm.unit = 'h4' THEN SUM(bm.req_qtt * prdr.ord_qtt)
            ELSE SUM(bm.req_qtt * prdr.ord_qtt)
         END AS "req_qtt",

         comm_name(CASE
            WHEN bm.unit = 'h6' THEN 'h1'
            WHEN bm.unit = 'h1' THEN 'h1'
            WHEN bm.unit = 'h2' THEN 'h1'
            WHEN bm.unit = 'h3' THEN 'h3'
            WHEN bm.unit = 'hc' THEN 'h3'
            ELSE bm.unit
          END) AS "unit",

         mstock.cur_qtt,
         comm_name(mstock.unit) AS "stock_unit"
FROM     bom_mat bm JOIN bom_tbl bt 
                      ON bm.bom_code = bt.bom_code
                    JOIN prdr_tbl prdr 
                      ON bt.prod_code = prdr.prod_code
                    JOIN mat_stock_v mstock 
                      ON bm.mat_code = mstock.mat_code
WHERE    prdr.prdr_code = ?
GROUP BY bm.mat_code, bm.mat_name, mstock.cur_qtt, unit, stock_unit
`;

const insertMoutbnd = `
INSERT INTO moutbnd_tbl(moutbnd_code, mat_unit, outbnd_qtt, moutbnd_date, emp_code, mat_code, prdr_code)
VALUES (?, ?, ?, curdate(), ?, ?, ?)
`;

// // 🟢 작업 진행 중인 것만 조회 (PRDR 필수)
// const selectWorkingProcesses = `
// SELECT  wko_code,
//         emp_code,
//         prod_code,
//         line_code,
//         wko_qtt,
//         line_eq_code,
//         pp_code,
//         eq_code,
//         eq_name,
//         eq_type,
//         po_code,
//         po_name,
//         prdr_code,
//         prdr_d_code,
//         proc_rate,
//         start_date,
//         end_date,
//         input_qtt,
//         def_qtt,
//         make_qtt
// FROM   processes_working_v
// WHERE  wko_code = ?
// ORDER BY pp_code
// `;

const updatePRDRStart = `
UPDATE prdr_tbl
SET    stat = ?
WHERE  prdr_code = ?
`;

const updatePRDRComplete = `
UPDATE prdr_tbl
SET    stat = ?,
       end_date = NOW(),
       total_time = end_date - start_date,
       proc_rate = 100
WHERE  prdr_code = ?
`;

// 작업 완료 시간 갱신
const updatePRDRDStart = `
UPDATE prdr_d_tbl
SET    proc_rate = ?,
       start_date = NOW()
WHERE  prdr_d_code = ?
`;

// 작업 진행률 갱신
const updatePRDRDRate = `
UPDATE prdr_d_tbl
SET proc_rate = ?
WHERE prdr_d_code = ?
`;

// 작업 완료 시간 갱신
const updatePRDRDComplete = `
UPDATE prdr_d_tbl
SET    proc_rate = ?,
       end_date = NOW(),
       total_time = end_date - start_date
WHERE  prdr_d_code = ?
`;

module.exports = {
  selectPRDRCodeForUpdate,
  insertPRDR,
  getCurrentMonthPlan,
  searchWorkingList,
  selectWKOProcesses,
  selectWorkDetailOne,
  selectWkocodeEqList,
  selectPRDRDCode,
  selectLineDetailList,
  insertPRDRD,
  selectPrdrDCodeForDetail,
  selectPrdrDCodeByWkoCode,
  updatePRDRDRate,
  selectMoutbndCode,
  selectMaterialListForPRDR,
  insertMoutbnd,
  updatePRDRStart,
  updatePRDRComplete,
  updatePRDRDComplete,
  updatePRDRDStart,
}