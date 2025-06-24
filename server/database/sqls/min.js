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
	  ,mat.mat_name
      ,comm_name(min.mat_type) as 'mat_type'
      ,comm_name(min.unit) as 'unit'
      ,min.inbnd_qtt
      ,min.inbnd_date
      ,min.ord_qtt
      ,min.qio_code
      ,min.lot_num
      ,cli.client_name
      ,emp.emp_name
FROM   minbnd_tbl min
LEFT JOIN mat_tbl mat
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

// 날짜 조건 반영을 위한 주문 조회
const selectMinListWithDate = `
  SELECT DISTINCT o.ord_code,
         o.ord_name,
         o.ord_date,
         o.note,
         c.client_name,
         comm_name(o.ord_stat) AS ord_stat,
         d.ord_amount,
         d.delivery_date
  FROM ord_tbl o
  INNER JOIN ord_d_tbl d ON o.ord_code = d.ord_code
  LEFT JOIN client_tbl c ON o.client_code = c.client_code
  WHERE o.ord_date BETWEEN ? AND ?
  ORDER BY o.ord_code
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

// 선택 자재정보 조회
const selectSearchMat =
`
SELECT mat.mat_code
	    ,mat.mat_name
      ,comm_name(mat.unit) as 'unit'
      ,comm_name(mat.material_type_code) as 'mat_type'
      ,cl.client_name as 'sup_name'
FROM   mat_tbl mat
	 LEFT OUTER JOIN client_tbl cl
     ON  mat.sup = cl.client_code
WHERE mat_code = ?
`;

// 품질검사지시정보 전체 조회
const selectAllQioList =
`
SELECT qio.qio_code,
       mprd.mat_code,
       mat.mat_name, 
       qio.qio_date
FROM   qio_tbl qio
INNER JOIN mpr_d_tbl mprd
        ON qio.mpr_d_code = mprd.mpr_d_code
INNER JOIN mat_tbl mat
        ON mprd.mat_code = mat.mat_code
`
;

/* ================================== 조회 끝 ================================== */
/* ================================== 등록 시작 ================================== */

// 자재입고코드 생성
const selectMinCodeForUpdate =
  `
SELECT CONCAT(
              CONCAT('MIN-', DATE_FORMAT( CURDATE(), '%Y%m%d-')), 
              LPAD(IFNULL(MAX(SUBSTR(minbnd_code, -3)), 0) + 1, 3, '0')
             ) AS minbnd_code
FROM minbnd_tbl
WHERE SUBSTR(minbnd_code, 5, 8) = DATE_FORMAT( CURDATE(), '%Y%m%d')
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

// 원자재 LOT 번호 생성
const selectLotNumForUpdateOne =
`
SELECT CONCAT('LOT-100-', 
           DATE_FORMAT(CURDATE(), '%Y%m%d'), '-', LPAD( IFNULL(MAX(SUBSTRING(lot_num, -3)), 0) + 1, 3,'0' )
       ) AS lot_num
FROM mat_lot_tbl
WHERE SUBSTRING(lot_num, 9, 8) = DATE_FORMAT(CURDATE(), '%Y%m%d')
FOR UPDATE;
`;

// 부자재 LOT 번호 생성
const selectLotNumForUpdateTwo =
`
SELECT CONCAT('LOT-200-', 
           DATE_FORMAT(CURDATE(), '%Y%m%d'), '-', LPAD( IFNULL(MAX(SUBSTRING(lot_num, -3)), 0) + 1, 3,'0' )
       ) AS lot_num
FROM mat_lot_tbl
WHERE SUBSTRING(lot_num, 9, 8) = DATE_FORMAT(CURDATE(), '%Y%m%d')
FOR UPDATE;
`;

// 반제품 LOT 번호 생성
const selectLotNumForUpdateThree =
`
SELECT CONCAT('LOT-300-', 
           DATE_FORMAT(CURDATE(), '%Y%m%d'), '-', LPAD( IFNULL(MAX(SUBSTRING(lot_num, -3)), 0) + 1, 3,'0' )
       ) AS lot_num
FROM mat_lot_tbl  
WHERE SUBSTRING(lot_num, 9, 8) = DATE_FORMAT(CURDATE(), '%Y%m%d')
FOR UPDATE;
`;



// 자재구매요청 (Min) 등록
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

// LOT 정보 등록
const insertMatLOT =
`
INSERT INTO mat_lot_tbl(
lot_num
,issdate
,item_type_code
,mat_code
)
VALUES (?, ?, ?, ?)
`

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
  selectMinListWithDate,
  selectAllMatList,
  selectSearchMat,
  selectAllQioList,
  


  /* 등록 */
  insertMinBnd,
  selectMinCodeForUpdate,
  selectLotNumForUpdate,
  selectLotNumForUpdateOne,
  selectLotNumForUpdateTwo,
  selectLotNumForUpdateThree,
  insertMatLOT,
  
  /* 삭제 */

}