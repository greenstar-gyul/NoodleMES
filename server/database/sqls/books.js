// Table : t_book_01
// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 조건없이 전체조회
const selectBookList =
`SELECT no
		, name
        , writer
        , publisher
        , publication_date
        , info 
FROM t_book_01
ORDER BY no`;

// 등록
const bookInsert =
`INSERT INTO t_book_01 (name, writer, publisher, publication_date, info)
VALUES (?, ?, ?, ?, ?)`;
// ?의 총 갯수는 2개이상이므로 배열이 필요하고 각 ?에 대체할 값이 입력될 컬럼은 명확 
// : 기본값을 5개 가진 배열
`INSERT INTO t_book_01
SET ?`

module.exports = {
    selectBookList,
    bookInsert,
}