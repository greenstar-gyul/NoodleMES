/*
made by KMS
자재입고관리
 */

// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

/* ================================== 조회 시작 ================================== */
// 자재입고목록 전체조회
const selectAllMatInList =
`
SELECT min.minbnd_code
	    ,min.mat_code
      ,mat.material_type_code
      ,comm_name(mat.material_type_code) as 'comm_mat_type'
      ,mat.unit
      ,comm_name(mat.unit) as 'comm_unit'
      ,min.inbnd_qtt
      ,min.inbnd_date
      ,min.ord_qtt
      ,min.qio_code
      ,min.lot_num
      ,min.mat_sup
      ,cli.client_name AS 'sup_name'
      ,emp.emp_code
      ,emp.emp_name as 'emp_name'
FROM   minbnd_tbl min
LEFT OUTER JOIN mat_tbl mat
	ON mat.mat_code = min.mat_code
LEFT JOIN client_tbl cli
	ON cli.client_code = min.mat_sup
LEFT JOIN emp_tbl emp
	ON emp.emp_code = min.mcode
`
;

// 자재입고목록 선택조회
const selectSearchMatInList =
`
SELECT min.minbnd_code
	    ,min.mat_code
      ,mat.material_type_code
      ,comm_name(mat.material_type_code) as 'comm_mat_type'
      ,mat.unit
      ,comm_name(mat.unit) as 'comm_unit'
      ,min.inbnd_qtt
      ,min.inbnd_date
      ,min.ord_qtt
      ,min.qio_code
      ,min.lot_num
      ,min.mat_sup
      ,cli.client_name AS 'sup_name'
      ,emp.emp_code
      ,emp.emp_name
FROM   minbnd_tbl min
LEFT OUTER JOIN mat_tbl mat
	ON mat.mat_code = min.mat_code
LEFT JOIN client_tbl cli
	ON cli.client_code = min.mat_sup
LEFT JOIN emp_tbl emp
	ON emp.emp_code = min.mcode
WHERE  min.minbnd_code LIKE '%?%'
`;

// 전체 자재기준정보 조회
const selectAllMatList =
`
SELECT mat.mat_code
	    ,mat.mat_name
      ,comm_name(mat.unit) as 'unit'
      ,comm_name(mat.material_type_code) as 'mat_type'
      ,cl.client_name as 'sup_name'
FROM   mat_tbl mat
	 LEFT OUTER JOIN client_tbl cl
     ON  mat.sup = cl.client_code
`;

// 품질검사지시정보 전체 조회
const selectAllQioList =
`
SELECT qio_code
	    ,qio_date
      ,prdr_code
      ,po_code
FROM   qio_tbl
`
;

/* ================================== 조회 끝 ================================== */
/* ================================== 등록 시작 ================================== */

// 자재입고코드 생성
const selectMinCodeForUpdate =
  `
SELECT CONCAT('MIN-', 
              LPAD(IFNULL(MAX(CAST(SUBSTRING(mpr_code, 5) AS UNSIGNED)), 0) + 1, 3, '0')
             ) AS mpr_code
FROM mpr_tbl
FOR UPDATE
`;

// LOT 번호 생성 임시
const selectLotNumForUpdate =
  `
SELECT CONCAT(
         'LOT-',
         CASE mat_type
           WHEN 't1' THEN '100'
           WHEN 't2' THEN '200'
           WHEN 'i2' THEN '300'
           ELSE '999'  -- 예외 처리
         END,
         '-',
         DATE_FORMAT(CURDATE(), '%Y%m%d'),
         '-',
         LPAD(
           IFNULL(
             MAX(SUBSTRING(lot_num, -3)), 0) + 1, 3, '0')
       ) AS lot_num
FROM minbnd_tbl
WHERE mat_type = 't2'
  AND SUBSTRING(lot_num, 9, 8) = DATE_FORMAT(CURDATE(), '%Y%m%d')
FOR UPDATE
`;
// 자재구매요청 (MPR) 등록
const insertMinBnd =
`
INSERT INTO minbnd_tbl (
minbnd_code
, mat_code
, mat_type
, unit
, inbnd_qtt
, inbnd_date
, ord_qtt
, qio_code
, lot_num
, mat_sup
, mcode )
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

/* ================================== 등록 끝 ================================== */
/* ================================== 삭제 시작 ================================== */

// MPR 삭제
const deleteMpr = 
`

`;

// MPR 상세 삭제
const deleteMprDetail = 
`

`;
/* ================================== 삭제 끝 ================================== */


module.exports = {
  /* 조회*/ 
  selectAllMatInList,
  selectSearchMatInList,
  selectAllMatList,
  selectAllQioList,


  /* 등록 */
  insertMinBnd,
  selectMinCodeForUpdate,
  selectLotNumForUpdate
  
  /* 삭제 */

}