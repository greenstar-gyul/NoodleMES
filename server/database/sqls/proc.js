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
ORDER BY prod_code`;

// 공정흐름도 목록 조회
const selectProcList = `
SELECT  prod_proc_code,
        po_name,
        prod_code,
        (SELECT prod_name FROM prod_tbl p WHERE p.prod_code = pp.prod_code) AS prod_name,
        reg,
        DATE_FORMAT(DATE_ADD(reg_date, INTERVAL 9 HOUR), '%Y-%m-%d') AS reg_date,
        comm_name(po_type) AS po_type,
        note
FROM    prod_proc_tbl pp
ORDER BY prod_proc_code;
`;

// 공정 흐름도 검색 쿼리
const searchProcList =
`SELECT prod_proc_code,
        po_name,
        pp.prod_code,
        (SELECT prod_name FROM prod_tbl p WHERE p.prod_code = pp.prod_code) AS prod_name,
        reg,
        DATE_FORMAT(DATE_ADD(reg_date, INTERVAL 9 HOUR), '%Y-%m-%d') AS reg_date,
        comm_name(po_type) AS po_type,
        note
FROM  prod_proc_tbl pp
WHERE (pp.prod_proc_code LIKE CONCAT('%', ?, '%') OR ? IS NULL)
      AND (pp.po_name LIKE CONCAT('%', ?, '%') OR ? IS NULL)
      AND (pp.prod_code LIKE CONCAT('%', ?, '%') OR ? IS NULL)
      AND (
          (SELECT prod_name FROM prod_tbl p WHERE p.prod_code = pp.prod_code) 
          LIKE CONCAT('%', ?, '%') OR ? IS NULL
          )
    AND (DATE(reg_date) >= ? OR ? IS NULL)
    AND (DATE(reg_date) <= ? OR ? IS NULL)
ORDER BY prod_proc_code;
`;

// 공정 흐름도 단건 조회
const procSelectOne = `
SELECT  pp.prod_proc_code,
        pp.po_name,
        pp.prod_code,
        p.prod_name,
        pp.reg,
        DATE_FORMAT(DATE_ADD(pp.reg_date, INTERVAL 9 HOUR), '%Y-%m-%d') AS reg_date,
        pp.po_type,
        pp.note
FROM    prod_proc_tbl pp
JOIN    prod_tbl p ON pp.prod_code = p.prod_code
WHERE   pp.prod_proc_code = ?
`;


// 공정 흐름도 상세 조회
const procDSelectOne = `
SELECT  ppd.pp_code,
        ppd.no,
        po.po_name,
        ppd.eq_type,
        comm_name(ppd.eq_type) AS eq_type_name,
        ppd.po_code
FROM prod_proc_d_tbl ppd
LEFT JOIN po_tbl po ON ppd.po_code = po.po_code
WHERE ppd.prod_proc_code = ?
ORDER BY ppd.no;
`;

// 공정조회 팝업
const processListPopup = `
SELECT  po_code,
        po_name,
        note
FROM po_tbl 
ORDER BY po_code
`;

// 설비유형 팝업
const eqTypeListPopup = `
SELECT com_value,
       comm_name(com_value) as eq_type
FROM   common_code
WHERE  group_value = '1A'
`

// 제품 공정 흐름도 등록
const insertProc = `
    INSERT INTO prod_proc_tbl (prod_proc_code,
                        po_name, 
                        po_type, 
                        reg_date,
                        note,
                        prod_code,
                        reg)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// 흐름도 상세 등록
const insertProcDetail = `
    INSERT INTO prod_proc_d_tbl (pp_code, 
                        no, 
                        prod_proc_code, 
                        po_code, 
                        eq_type)
    VALUES (?, ?, ?, ?, ?)
`;

// 제품 공정 흐름도 코드 자동 생성 쿼리
const selectProcCodeForUpdate = `
SELECT CONCAT('PROC-',
              LPAD(IFNULL(MAX(CAST(SUBSTRING(prod_proc_code, 6) AS UNSIGNED)), 0) + 1, 4, '0')
              )
FROM prod_proc_tbl
FOR UPDATE
`;
// 흐름도 상세 코드 자동 생성 쿼리
const selectPpdCodeForUpdate = `
SELECT CONCAT('PPD-',LPAD(IFNULL(MAX(CAST(SUBSTRING(pp_code, 5) AS UNSIGNED)), 0) + 1,3,'0')
              ) AS new_pp_code
FROM prod_proc_d_tbl
FOR UPDATE;
`;

module.exports = {
  selectProdList,
  selectProcList,
  searchProcList,
  procSelectOne,
  procDSelectOne,
  processListPopup,
  eqTypeListPopup,
  insertProc,
  insertProcDetail,
  selectProcCodeForUpdate,
  selectPpdCodeForUpdate
};