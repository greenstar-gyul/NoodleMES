// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 제품 목록 조회 (com_value가 'i1'인 경우만)
const selectProdList = `
SELECT  prod_code,
        prod_name,
        comm_name(spec) AS "spec",
        comm_name(unit) AS "unit",
        comm_name(com_value) AS "com_value"
FROM prod_tbl
WHERE prod_type = 'i1'
ORDER BY prod_code;`;

// 공정흐름 팝업
const processListPopup = `
SELECT d.no,
       d.po_code,
       p.po_name,
       d.pp_code
FROM prod_proc_d_tbl d
LEFT JOIN po_tbl p ON d.po_code = p.po_code
`;

module.exports = {
  selectProdList,
  processListPopup
};