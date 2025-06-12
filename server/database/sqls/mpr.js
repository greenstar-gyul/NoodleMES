/*
25.06.08 ~ 12
made by KMS
자재구매요청관리
 */

// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 자재구매요청 (MPR) 전체조회
const selectAllMprList =
`SELECT mpr_code
        , reqdate
        , deadline
        , mrp_code
        , mcode
FROM mpr_tbl
ORDER BY mpr_code`;

const selectSearchMprList =
`SELECT mpr_code
	 , reqdate
	 , deadline
     , mrp_code
     , mcode
FROM   mpr_tbl
WHERE  mpr_code LIKE CONCAT('%', ?, '%') -- mpr_code자리와 LIKE의 %% 사이에 검색값 변수 넣기
  AND  reqdate BETWEEN (IFNULL(?, '1970-01-01')) AND (IFNULL(?, '9999-12-31')) -- 처음 IFNULL의 첫 매개변수 : from~ , 다음 IFNULL의 첫 매개변수 : to~ 
  AND  deadline BETWEEN (IFNULL(?, '1970-01-01')) AND (IFNULL(?, '9999-12-31')) -- 처음 IFNULL의 첫 매개변수 : from~ , 다음 IFNULL의 첫 매개변수 : to~ 
  AND  mrp_code LIKE CONCAT('%', ?, '%') -- mrp_code자리와 LIKE의 %% 사이에 검색값 변수 넣기
  AND  mcode    LIKE (CONCAT('%',? ,'%')) -- mcode자리와 LIKE의 %% 사이에 검색값 변수 넣기
ORDER BY mpr_code
`;

module.exports = {
    selectAllMprList,
    selectSearchMprList,
}