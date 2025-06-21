/*
made by KMS
자재입고관리
 */

// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

/* ================================== 조회 시작 ================================== */
// 자재입고목록 () 전체조회
const selectAllMatInList =
`
SELECT min.minbnd_code
	    ,min.mat_code
      ,comm_name(mat.material_type_code) as 'mat_type'
      ,comm_name(mat.unit) as 'unit'
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

// 자재입고목록 () 선택조회
const selectSearchMatInList =
`
SELECT min.minbnd_code
	  ,min.mat_code
      ,comm_name(mat.material_type_code) as 'mat_type'
      ,comm_name(mat.unit) as 'unit'
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

// 자재 전체 조회
const select = 
`

`;

/* ================================== 조회 끝 ================================== */
/* ================================== 등록 시작 ================================== */


// 자재구매요청 (MPR) 등록
const insertMpr =
`

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


  /* 등록 */
  insertMpr,

  
  /* 삭제 */

}