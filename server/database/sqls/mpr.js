/*
25.06.08 ~ 12
made by KMS
자재구매요청관리
 */

// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

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

// 자재구매요청 (MPR) 등록
const insertMpr =
`
INSERT INTO mpr_tbl (mpr_code
                   , redate
                   , deadline
                   , mrp_code
                   , mcode )
VALUES (?, ?, ?, ?, ?)
`;

// 자재구매요청상세(MPR Detail) 등록
const insertMprD =
`
INSERT INTO mpr_d_tbl (mpr_d_code
                     , mat_code
                     , req_qtt
                     , unit
                     , mpr_code
                     , mat_sup
                     , note )
VALUES (?, ?, ?, ?, ?, ? , ?)
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
WHERE  mpr_code = ?;
`;

module.exports = {
    selectAllMprList,
    selectSearchMprList,
    insertMpr,
    insertMprD,
    selectMprDList,
}