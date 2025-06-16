// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 목록 조회
const selectLineList = `
SELECT  line_code,
        line_name,
        comm_name(line_type) AS "line_type",
        regdate_t,
        note,
        comm_name(is_used) AS "is_used"
FROM    line_tbl
ORDER BY line_code ;
`;


// 🔍 Line 목록 검색 쿼리 개선
const searchLineList = `
  SELECT  line_code,
          line_name,
          is_used,
          regdate_t
  FROM    line_tbl
  WHERE   1=1
    AND  (? IS NULL OR line_code LIKE CONCAT('%', ?, '%'))
    AND  (? IS NULL OR line_name LIKE CONCAT('%', ?, '%'))
    AND  (? IS NULL OR is_used = ?)
    AND  (
         (? IS NULL OR ? IS NULL)
         OR (regdate_t >= ? AND regdate_t < DATE_ADD(?, INTERVAL 1 DAY))
        )
  ORDER BY line_code;
`;

// 공정흐름 팝업
const processListPopup = `
SELECT d.no,
       d.po_code,
       p.po_name,
       d.pp_code
FROM prod_proc_d_tbl d
LEFT JOIN po_tbl p ON d.po_code = p.po_code
`;

// 설비 목록 팝업
const facilitieListPopup = `
SELECT eq_code,
       eq_name,
       eq_type
FROM eq_tbl
`;

// 라인 등록 
const insertLine = `
INSERT INTO line_tbl (line_code,
                      line_name,
                      line_type,
                      mdept_code,
                      regdate_t,
                      is_used,
                      note)
VALUES (?, ?, ?, ?, ?, ?, ?);
`

const insertLineDetail = `
INSERT INTO line_d_tbl (line_eq_code,
                        pp_code,
                        line_code,
                        eq_code) 
VALUES (?, ?, ?, ?)
`;

// 라인코드 자동 생성 쿼리
const selectLineCodeForUpdate = `
SELECT  CONCAT('LINE-',
        LPAD(IFNULL(MAX(SUBSTR(line_code, 6)), 0) + 1, 3, '0'))
FROM    line_tbl
FOR UPDATE
`;

// 라인상세 코드 자동 생성 쿼리
const selectLECodeForUpdate = `
SELECT CONCAT('LE-', LPAD(IFNULL(MAX(SUBSTR(line_eq_code, -4)), 0) + 1, 4, '0'))
FROM line_d_tbl
FOR UPDATE;
`;
const selectLineOne = `
SELECT 
line_code,
line_name,
line_type,
is_used,
regdate_t,
note,
mdept_code
FROM line_tbl
WHERE line_code = ?
`;

const selectLineDetail = `
SELECT  ld.line_eq_code, 
        ld.pp_code,  
        ld.line_code, 
        ld.eq_code,  
        pp.no,
        pp.eq_type,  
        pp.po_code, 
        po.po_name,
        eq.eq_name
FROM line_d_tbl ld
LEFT JOIN prod_proc_d_tbl pp ON ld.pp_code = pp.pp_code
LEFT JOIN po_tbl po ON pp.po_code = po.po_code    
LEFT JOIN eq_tbl eq ON ld.eq_code = eq.eq_code
WHERE ld.line_code = ?
`;

// 제품 목록 조회
const selectProdList = 
`SELECT prod_code,
        prod_name,
        comm_name(spec) AS "spec",
        comm_name(unit) AS "unit",
        comm_name(com_value) AS "com_value"
FROM prod_tbl
ORDER BY prod_code`;

// 제품 선택시 제품흐름도상세 조회
const selectProdDetail =`
SELECT 
    ppd.no,
    ppd.po_code,
    po.po_name,
    ppd.eq_type,
    comm_name(ppd.eq_type) AS eq_type_name
FROM prod_proc_tbl pp
JOIN prod_proc_d_tbl ppd ON pp.prod_proc_code = ppd.prod_proc_code
JOIN po_tbl po ON ppd.po_code = po.po_code
WHERE pp.prod_code = ?
ORDER BY ppd.no;
`;

module.exports = {
    selectLineList,
    searchLineList,
    processListPopup,
    facilitieListPopup,
    insertLine,
    insertLineDetail,
    selectLineCodeForUpdate,
    selectLECodeForUpdate,
    selectLineOne,
    selectLineDetail,
    selectProdList,
    selectProdDetail
};