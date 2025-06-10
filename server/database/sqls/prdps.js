
// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 조건없이 전체조회
const selectPrdpList =
`SELECT prdp_code
        , prdp_name 
        , prdp_date
        , start_date
        , end_date
        , due_date
        , note
FROM prdp_tbl
ORDER BY prdp_code`;

module.exports = {
    selectPrdpList,
}