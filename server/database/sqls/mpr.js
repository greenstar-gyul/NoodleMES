/*
25.06.08 ~ 12
made by KMS
자재구매요청관리
 */

// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

/* ================================== 조회 시작 ================================== */
// 자재구매요청 (MPR) 전체조회
const selectAllMprList =
`
SELECT mpr_code
     , reqdate
     , deadline
     , mrp_code
     , mcode
FROM mpr_tbl
ORDER BY mpr_code`;

// 자재구매요청 (MPR) 검색
const selectSearchMprList =
`
SELECT mpr_code
  	 , reqdate
	   , deadline
     , mrp_code
     , mcode
FROM   mpr_tbl
WHERE  mpr_code LIKE CONCAT('%', ?, '%')
  AND  reqdate BETWEEN (IFNULL(?, '1970-01-01')) AND (IFNULL(?, '9999-12-31'))
  AND  deadline BETWEEN (IFNULL(?, '1970-01-01')) AND (IFNULL(?, '9999-12-31'))
  AND  mrp_code LIKE CONCAT('%', ?, '%')
  AND  mcode    LIKE (CONCAT('%',? ,'%'))
ORDER BY mpr_code
`;

// 자재구매요청상세(MPR Detail) 조회
const selectMprDList =
`
SELECT mprd.mat_code
    ,  mat.mat_name
    ,  mprd.req_qtt
    ,  mprd.unit
    ,  mprd.mat_sup
FROM   mpr_d_tbl mprd
LEFT OUTER JOIN mat_tbl mat
ON mprd.mat_code = mat.mat_code
WHERE  mprd.mpr_code = ?;
`;

// 전체 MRP 조회
const selectMRPList = 
`
SELECT   mrp_code,
         plan_date,
         start_date,
         mrp_note,
         prdp_code,
         emp_code
FROM     mrp_tbl
ORDER BY mrp_code
`;


/* ================================== 조회 끝 ================================== */
/* ================================== 등록 시작 ================================== */


// 자재구매요청 (MPR) 등록
const insertMpr =
`
INSERT INTO mpr_tbl (
mpr_code
, redate
, deadline
, mrp_code
, mcode )
VALUES (?, ?, ?, ?, ?)
`;

// 자재구매요청상세(MPR Detail) 등록
const insertMprD =
`
INSERT INTO mpr_d_tbl (
mpr_d_code
, mat_code
, req_qtt
, unit
, mpr_code
, mat_sup
, note )
VALUES (?, ?, ?, ?, ?, ? , ?)
`;

// 자재구매요청 코드 생성
const selectMprCodeForUpdate =
`
SELECT CONCAT('MPR-', 
              LPAD(IFNULL(MAX(CAST(SUBSTRING(mpr_code, 7) AS UNSIGNED)), 0) + 1, 3, '0')
             ) AS mpr_code
FROM mpr_tbl
FOR UPDATE
`;

// 자재구매요청 상세 코드 생성
const selectMprDCodeForUpdate =
`
SELECT CONCAT('MPR-D-', 
              LPAD(IFNULL(MAX(CAST(SUBSTRING(mpr_d_code, 9) AS UNSIGNED)), 0) + 1, 3, '0')
             ) AS mpr_d_code
FROM mpr_d_tbl
FOR UPDATE
`;

/* ================================== 등록 끝 ================================== */
/* ================================== 삭제 시작 ================================== */

// MPR 삭제
const deleteMpr = 
`
DELETE FROM mpr_tbl WHERE mpr_code = ?
`;

// MPR 상세 삭제
const deleteMprDetail = 
`
DELETE FROM mpr_d_tbl WHERE mpr_code = ?
`;
/* ================================== 삭제 끝 ================================== */


module.exports = {
  /* 조회*/ 
  selectAllMprList,
  selectSearchMprList,
  selectMprDList,
  selectMRPList,

  /* 등록 */
  insertMpr,
  insertMprD,
  selectMprCodeForUpdate,
  selectMprDCodeForUpdate,
  
  /* 삭제 */
  deleteMpr,
  deleteMprDetail,
}