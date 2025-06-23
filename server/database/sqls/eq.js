// 기본사용 쿼리문 - 설비 조회
const BASE_QUERY = `
SELECT   eq_code
         ,eq_name
         ,eq_model
         ,eq_maker
         ,capacity
         ,stat
         ,eq_make_date
         ,bring_date
         ,take_date
         ,eq_pos
         ,eq_type
         ,is_used
FROM     eq_tbl
`;

const BASE_QUERY_FOR_EQII = `
SELECT e.eqii_code
       ,e.inst_date
       ,e.chk_exp_date
       ,e.stat
       ,e.note
       ,e.inst_emp_code 
       ,m.emp_name AS inst_emp_name
FROM   eqii_tbl e
JOIN emp_tbl AS m
ON e.inst_emp_code = m.emp_code
`;

const BASE_QUERY_FOR_EQIR = `
SELECT r.eqir_code
       ,e.eq_name
       ,r.chk_start_date
       ,r.chk_end_date
       ,r.chk_detail
       ,r.chk_result
       ,r.eqi_stat
       ,COALESCE(r.note, '내용없음') AS note
FROM   eqir_tbl as r
LEFT JOIN eq_tbl as e
ON r.eq_code = e.eq_code
`;

const BASE_QUERY_FOR_EQIR_BY_EQIT = `
SELECT eq_type
       ,chk_text
       ,chk_mth
       ,range_top
       ,range_bot
       ,unit
       ,jdg_mth
FROM eqi_type_tbl
`

const selectEqitList = `
SELECT r.eqir_code 
       ,t.chk_type_code
       ,t.chk_text       
       ,e.eq_name
       ,t.eq_type
       ,r.chk_start_date
       ,r.chk_end_date
       ,r.chk_detail
       ,COALESCE(r.chk_result, '내용없음') AS chk_result       
       ,r.eqi_stat
       ,COALESCE(r.note, '내용없음') AS note
FROM eqir_tbl AS r
JOIN eq_tbl AS e ON r.eq_code = e.eq_code
JOIN eqi_type_tbl AS t ON r.chk_type_code = t.chk_type_code
WHERE r.eqii_code = ?
`;

const simpleslectEqirList = `
SELECT r.eqir_code
       ,e.eq_name
        ,r.chk_type_code
        ,r.chk_start_date
        ,r.chk_end_date
        ,r.eqi_stat
FROM eqir_tbl AS r
JOIN eq_tbl AS e ON r.eq_code = e.eq_code
`;


const BASE_QUERY_FOR_EQIR_BY_EQIRMG = `
SELECT m.eq_ma_code
       ,eq.eq_name
       ,m.fail_date
       ,m.fail_cause
       ,m.act_detail
       ,m.act_result
       ,m.start_date
       ,m.end_date
       ,m.re_chk_exp_date
       ,m.eqir_code
       ,m.regdate
       ,m.note
       ,emp1.emp_name AS m_emp_name
       ,emp2.emp_name AS fix_emp_name
FROM eq_ma_tbl AS m
JOIN eqir_tbl AS eqir ON m.eqir_code = eqir.eqir_code
JOIN eq_tbl AS eq ON eqir.eq_code = eq.eq_code
JOIN emp_tbl AS emp1 ON m.mcode = emp1.emp_code
JOIN emp_tbl AS emp2 ON m.fix_emp_code = emp2.emp_code
`;

// 파라미터별 검색
function buildSearch(searchParams) {
  const hasCondition = searchParams &&
    Object.values(searchParams).some(val => val !== null && val !== '' && val != undefined);

  // 검색 조건이 없으면 전체 출력
  if (!hasCondition) {
    return {
      sql: BASE_QUERY + ' ORDER BY eq_code',
      values: []
    };
  }

  // 검색 조건이 있으면 WHERE 절 생성
  let sql = BASE_QUERY;
  const conditions = [];
  const values = [];

  // 설비코드 (부분 검색)
  if (searchParams.eq_code && searchParams.eq_code.trim() !== '') {
    conditions.push('eq_code LIKE ?');
    values.push(`%${searchParams.eq_code.trim()}%`);
  }

  // 설비명 (부분 검색)
  if (searchParams.eq_name && searchParams.eq_name.trim() !== '') {
    conditions.push('eq_name LIKE ?');
    values.push(`%${searchParams.eq_name.trim()}%`);
  }

  // 제조사 (부분 검색)
  if (searchParams.eq_maker && searchParams.eq_maker.trim() !== '') {
    conditions.push('eq_maker LIKE ?');
    values.push(`%${searchParams.eq_maker.trim()}%`);
  }

  // 사용여부 (정확 검색)
  if (searchParams.is_used && searchParams.is_used.trim() !== '') {
    conditions.push('is_used = ?');
    values.push(searchParams.is_used.trim());
  }

  // WHERE 절 추가
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY eq_code';

  return { sql, values };
}

const searchEqii = `
SELECT e.eqii_code
        ,e.inst_date
        ,e.chk_exp_date
        ,e.stat
        ,e.note
        ,e.inst_emp_code
        ,m.emp_name AS inst_emp_name
FROM eqii_tbl e
JOIN emp_tbl AS m ON e.inst_emp_code = m.emp_code
WHERE 1=1
  AND (? IS NULL OR e.eqii_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR e.stat LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR m.emp_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR DATE(e.inst_date) >= DATE(?))
  AND (? IS NULL OR DATE(e.inst_date) <= DATE(?))
ORDER BY e.eqii_code
`;

const searchEqMa = `
SELECT m.eq_ma_code
       ,eq.eq_name
       ,m.fail_date
       ,m.fail_cause
       ,m.act_detail
       ,m.act_result
       ,m.start_date
       ,m.end_date
       ,m.re_chk_exp_date
       ,m.eqir_code
       ,m.regdate
       ,m.note
       ,emp1.emp_name AS m_emp_name
       ,emp2.emp_name AS fix_emp_name
FROM eq_ma_tbl AS m
JOIN eqir_tbl AS eqir ON m.eqir_code = eqir.eqir_code
JOIN eq_tbl AS eq ON eqir.eq_code = eq.eq_code
JOIN emp_tbl AS emp1 ON m.mcode = emp1.emp_code
JOIN emp_tbl AS emp2 ON m.fix_emp_code = emp2.emp_code
WHERE 1=1
  AND (? IS NULL OR m.eq_ma_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR eq.eq_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR m.act_result LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR m.fail_cause LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR DATE(m.fail_date) >= DATE(?))
  AND (? IS NULL OR DATE(m.fail_date) <= DATE(?))
  AND (? IS NULL OR emp1.emp_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR emp2.emp_name LIKE CONCAT('%', ?, '%'))
ORDER BY m.eq_ma_code DESC
`;

// eq_code 자동생성 
// SELECT eq_code for new insert
const selectEqCodeForUpdate = `
SELECT CONCAT(
    'EQ-', ?, '-',
    LPAD(COALESCE(MAX(SUBSTR(eq_code, -4)), 0) + 1, 4, '0')
) AS next_eq_code
FROM eq_tbl
WHERE eq_type = ?
  AND eq_code LIKE CONCAT('EQ-', ?, '-%')
FOR UPDATE
`;

// eqir_code 자동생성
// eqir code = EQIR-001

const selectEqirCodeForUpdate = `
SELECT CONCAT(
    'EQIR-', 
    LPAD(COALESCE(MAX(SUBSTR(eqir_code, -3)), 0) + 1, 3, '0')
) AS next_eqir_code
FROM eqir_tbl
WHERE eqir_code LIKE 'EQIR-%'
FOR UPDATE
`;

// eq_ma_tbl의 PK, eq_ma_code 자동생성
// EQMA-20250515-001
const selectEqMaCodeForUpdate = `
SELECT CONCAT(
    'EQMA-', 
    DATE_FORMAT(NOW(), '%Y%m%d'), '-', 
    LPAD(COALESCE(MAX(SUBSTR(eq_ma_code, -3)), 0) + 1, 3, '0')
) AS next_eq_ma_code
FROM eq_ma_tbl
WHERE eq_ma_code LIKE CONCAT('EQMA-', DATE_FORMAT(NOW(), '%Y%m%d'), '-%')
FOR UPDATE
`;


// eqii_code 자동생성
// eqii code = EQI-20250601-001

const selectEqiiCodeForUpdate = `
SELECT CONCAT(
    'EQI-', 
    DATE_FORMAT(NOW(), '%Y%m%d'), '-', 
    LPAD(COALESCE(MAX(SUBSTR(eqii_code, -3)), 0) + 1, 3, '0')
) AS next_eqii_code
FROM eqii_tbl
WHERE eqii_code LIKE CONCAT('EQI-', DATE_FORMAT(NOW(), '%Y%m%d'), '-%')
FOR UPDATE
`;

const insertEq = `
INSERT INTO eq_tbl
(eq_code
,eq_name
,eq_model
,eq_maker
,capacity
,stat
,eq_make_date
,bring_date
,take_date
,eq_pos
,eq_type
,is_used)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const insertEqMa = `
INSERT INTO eq_ma_tbl
( eq_ma_code
,fail_date
,fail_cause
,act_detail
,act_result
,start_date
,end_date
,re_chk_exp_date
,regdate
,note
,eqir_code
,mcode
,fix_emp_code)
VALUES
(?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, 
(SELECT emp_code FROM emp_tbl WHERE emp_name = ?) 
,(SELECT emp_code FROM emp_tbl WHERE emp_name = ?))
`;

const deleteEqMa = `
DELETE FROM eq_ma_tbl
WHERE eq_ma_code = ?
`;

const updateEqMa = `
UPDATE eq_ma_tbl
SET
  fail_date = ?,
  fail_cause = ?,
  act_detail = ?,
  act_result = ?,
  start_date = ?,
  end_date = ?,
  re_chk_exp_date = ?,
  note = ?,
  mcode = (SELECT emp_code FROM emp_tbl WHERE emp_name = ?),
  fix_emp_code = (SELECT emp_code FROM emp_tbl WHERE emp_name = ?)
WHERE
  eq_ma_code = ?
`;

const updateEq = `
UPDATE eq_tbl 
SET eq_name = ?
    ,eq_model = ?
    ,eq_maker = ?
    ,capacity = ?
    ,stat = ?
    ,eq_make_date = ?
    ,bring_date = ?
    ,take_date = ?
    ,eq_pos = ?
    ,eq_type = ?
    ,is_used = ?
WHERE eq_code = ?
`;

const selectEqiistatus = `
SELECT stat
FROM eqii_tbl
WHERE eqii_code = ?
`;

const insertEqii = `
INSERT INTO eqii_tbl
(eqii_code
 ,inst_date
 ,chk_exp_date
 ,stat
 ,note
 ,inst_emp_code)
 VALUES (?, ?, ?, ?, ?, ?)
`;

const updateEqii = `
UPDATE eqii_tbl
SET inst_date = ?
    ,chk_exp_date = ?
    ,stat = ?
    ,note = ?
    ,inst_emp_code = ?
WHERE eqii_code = ?
`;

const insertEqir = `
INSERT INTO eqir_tbl (
   eqir_code
   ,eqii_code
   ,eq_code
   ,chk_type_code
   ,chk_start_date
   ,chk_end_date
   ,chk_detail
   ,chk_result
   ,eqi_stat
   ,note
) 
SELECT 
   ?, ?, e.eq_code, t.chk_type_code, ?, ?, ?, ?, ?, ?
FROM eq_tbl AS e, eqi_type_tbl AS t
WHERE e.eq_name = ? 
AND t.chk_text = ?;
`;

const updateEqir = `
UPDATE eqir_tbl
SET chk_start_date = ?
    ,chk_end_date = ?
    ,chk_detail = ?
    ,chk_result = ?
    ,eqi_stat = ?
    ,note = ?
WHERE eqir_code = ?
`;

module.exports = {
  // 전체 조회 (첫 화면용)
  selectEqList: BASE_QUERY + ' ORDER BY eq_code',

  selectEqiiList: BASE_QUERY_FOR_EQII + ' ORDER BY eqii_code',

  selectEqiiByCode: BASE_QUERY_FOR_EQII + ' WHERE e.eqii_code = ?',

  // selectEqirList: BASE_QUERY_FOR_EQIR + ' WHERE eqii_code = ?',

  selectEqiType: BASE_QUERY_FOR_EQIR_BY_EQIT,

  selectEqirMgList: BASE_QUERY_FOR_EQIR_BY_EQIRMG,

  selectEqirMgListByCode: BASE_QUERY_FOR_EQIR_BY_EQIRMG + ' WHERE m.eq_ma_code = ?',

  // selectEqitList: BASE_QUERY_FOR_EQIR_BY_EQIT + ' WHERE e.eq_type = ?',

  selectEqirList: selectEqitList,

  simpleslectEqirList: simpleslectEqirList,

  // 동적 검색 (검색 조건 유무에 따라 전체, 조건부 검색)
  buildSearch: buildSearch,

  selectEqiistatus: selectEqiistatus,

  // 기본 조회
  selectEqByCode: BASE_QUERY + ' WHERE eq_code = ?',

  // 설비 등록 쿼리
  insertEq: insertEq,

  // 설비 관리 등록 쿼리
  insertEqMa: insertEqMa,

  // 설비 관리 삭제 쿼리
  deleteEqMa: deleteEqMa,

  // 설비 관리 수정 쿼리
  updateEqMa: updateEqMa,

  // 설비 수정 쿼리
  updateEq: updateEq,

  // 설비 삭제 쿼리
  deleteEq: `
    DELETE FROM eq_tbl 
    WHERE eq_code = ?
  `,

  deleteEqirByEqiiCode: `
    DELETE FROM eqir_tbl 
    WHERE eqii_code = ?
  `,

  deleteEqiiByCode: `
    DELETE FROM eqii_tbl 
    WHERE eqii_code = ?
  `,

  deleteEqMaByEqiiCode: `
    DELETE FROM eq_ma_tbl 
    WHERE eqir_code IN (
      SELECT eqir_code FROM eqir_tbl WHERE eqii_code = ?
    )
  `,
  selectEqirCodesByEqiiCode: `
    SELECT eqir_code 
    FROM eqir_tbl 
    WHERE eqii_code = ?
  `,

  deleteEqirByCode: `
    DELETE FROM eqir_tbl 
    WHERE eqir_code = ?
  `,

  deleteEqMaByEqirCode: `
    DELETE FROM eq_ma_tbl 
    WHERE eqir_code = ?
  `,

  checkLineUsage: `
    SELECT DISTINCT eq_code 
    FROM line_d_tbl 
    WHERE eq_code = ?
  `,
  
  searchEqii: searchEqii,
  searchEqMa: searchEqMa,
  selectEqCodeForUpdate: selectEqCodeForUpdate,
  selectEqirCodeForUpdate: selectEqirCodeForUpdate,
  selectEqiiCodeForUpdate: selectEqiiCodeForUpdate,
  selectEqMaCodeForUpdate: selectEqMaCodeForUpdate,
  updateEqii: updateEqii,
  insertEqir: insertEqir,
  updateEqir: updateEqir,
  selectEqitList: selectEqitList,
  selectEqirByCode: BASE_QUERY_FOR_EQIR + ' WHERE r.eqir_code = ?',
  // 추가적인 쿼리문은 필요에 따라 여기에 추가
};