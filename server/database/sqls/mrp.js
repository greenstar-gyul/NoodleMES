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
       mrp_d.mat_code,
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

// MRP 코드 생성하면서 트랜잭션 발생
const selectMRPCodeForUpdate = `
SELECT CONCAT(
              CONCAT('MRP-', DATE_FORMAT( CURDATE(), '%Y%m%d-')), 
              LPAD(IFNULL(MAX(SUBSTR(mrp_code, -3)), 0) + 1, 3, '0')
             ) AS "mrp_code"
FROM mrp_tbl
WHERE SUBSTR(mrp_code, 5, 8) = DATE_FORMAT( CURDATE(), '%Y%m%d')
FOR UPDATE
`

// MRP 상세 코드 발급
const selectMRPDetailCode = `
SELECT CONCAT(
              'MRP-D-',
              LPAD(IFNULL(MAX(SUBSTR(mrp_d_code, -4)), 0) + 1, 4, '0')
             ) AS "mrp_d_code"
FROM mrp_d_tbl
`

// MRP 등록
const insertMRP = `
INSERT INTO mrp_tbl(mrp_code, plan_date, start_date, mrp_note, prdp_code, emp_code)
VALUES (?, ?, ?, ?, ?, ?)
`

// MRP 상세 등록
const insertMRPDetail = `
INSERT INTO mrp_d_tbl(mrp_d_code, unit, req_qtt, mrp_code, mat_code)
VALUES (?, ?, ?, ?, ?)
`

// BOM에서 자재 목록 가져와서 자재 목록 추가하기
// const selectBOMbyprdpcode = `
// SELECT   bm.mat_code,
//          bm.mat_name,
//          SUM(bm.req_qtt * pd.planned_qtt) AS "req_qtt",
//          comm_name(bm.unit) AS "unit",
//          mstock.cur_qtt,
//          comm_name(mstock.unit) AS "stock_unit"
// FROM     bom_mat bm JOIN bom_tbl bt 
//                       ON bm.bom_code = bt.bom_code
//                     JOIN prdp_d_tbl pd 
//                       ON bt.prod_code = pd.prod_code
//                     JOIN mat_stock_v mstock 
//                       ON bm.mat_code = mstock.mat_code
// WHERE    pd.prdp_code = ?
// GROUP BY bm.mat_code, bm.mat_name, mstock.cur_qtt, unit
// `;
const selectBOMbyprdpcode = `
WITH RECURSIVE bom_explosion(mat_code, mat_name, mat_type, req_qtt, unit, level) AS (
  -- 1단계: 직접 자재
  SELECT bm.mat_code, 
         bm.mat_name,
         bm.mat_type,
         bm.req_qtt * pd.planned_qtt AS req_qtt,
         bm.unit,
         1 AS level
  FROM   bom_mat bm 
         JOIN bom_tbl bt ON bm.bom_code = bt.bom_code 
         JOIN prdp_d_tbl pd ON bt.prod_code = pd.prod_code 
  WHERE  pd.prdp_code = ?  -- ✅ 파라미터로 변경
  
  UNION ALL
  
  -- 2단계: 반제품의 하위 자재들
  SELECT sub_bm.mat_code,
         sub_bm.mat_name,
         sub_bm.mat_type,
         sub_bm.req_qtt * be.req_qtt AS req_qtt,
         sub_bm.unit,
         be.level + 1
  FROM   bom_explosion be
         JOIN bom_tbl sub_bt ON be.mat_code = sub_bt.prod_code
         JOIN bom_mat sub_bm ON sub_bt.bom_code = sub_bm.bom_code
  WHERE  be.mat_type = 'i2'
    AND  be.level < 5
)
SELECT   be.mat_code,
         be.mat_name,
         -- ✅ 소요량 단위 변환 (kg/L 통일)
         SUM(
           CASE 
             WHEN be.unit = 'h1' THEN be.req_qtt                    -- kg → kg
             WHEN be.unit = 'h2' THEN be.req_qtt * 1000             -- t → kg
             WHEN be.unit = 'h6' THEN be.req_qtt / 1000             -- g → kg
             WHEN be.unit = 'hb' THEN be.req_qtt / 1000000          -- mg → kg
             WHEN be.unit = 'h3' THEN be.req_qtt                    -- L → L
             WHEN be.unit = 'hc' THEN be.req_qtt / 1000             -- ml → L
             ELSE be.req_qtt
           END
         ) AS req_qtt,
         -- ✅ 통일된 단위 표시
         CASE 
           WHEN be.unit IN ('h1', 'h2', 'h6', 'hb') THEN 'kg'
           WHEN be.unit IN ('h3', 'hc') THEN 'L'
           ELSE comm_name(be.unit)
         END AS unit,
         mstock.cur_qtt,
         comm_name(mstock.unit) AS stock_unit
FROM     bom_explosion be
         JOIN mat_stock_v mstock ON be.mat_code = mstock.mat_code
WHERE    be.mat_type != 'i2'  -- 반제품 제외, 최종 원자재/부자재만
GROUP BY be.mat_code, 
         be.mat_name, 
         CASE 
           WHEN be.unit IN ('h1', 'h2', 'h6', 'hb') THEN 'kg'
           WHEN be.unit IN ('h3', 'hc') THEN 'L'
           ELSE comm_name(be.unit)
         END,
         mstock.cur_qtt,
         stock_unit
ORDER BY be.mat_code
`;

// 전체 자재 목록 가져오기
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

// MRP 수정
const updateMRP = `
UPDATE mrp_tbl 
SET mrp_note = ?
WHERE mrp_code = ?
`;

// MRP 상세 수정
const updateMRPDetail = `
UPDATE mrp_d_tbl 
SET req_qtt = ?
WHERE mrp_d_code = ?
`;

// 조건에 맞는 MRP 조회
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

// MRP의 자재 추가 팝업에서 자재 검색
const selectMatForPopup = `
SELECT mat.mat_code,
       mat.mat_name,
       comm_name(mat.unit) AS "unit",
       mat.note,
       comm_name(mat.material_type_code) AS "mat_type",
       mstock.cur_qtt,
       comm_name(mstock.unit) AS "stock_unit"
FROM   mat_tbl mat JOIN mat_stock_v mstock
                     ON mat.mat_code = mstock.mat_code
WHERE  1 = 1
  AND  (? IS NULL OR mat.mat_name LIKE CONCAT('%', ?, '%'))
ORDER BY mat_code
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
    selectMatForPopup,
}