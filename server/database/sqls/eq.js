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
SELECT eqii_code
       ,inst_date
       ,chk_exp_date
       ,stat
       ,note
       ,inst_emp_code
FROM   eqii_tbl
`;

const BASE_QUERY_FOR_EQIR = `
SELECT r.eqir_code
       ,e.eq_name
       ,r.chk_start_date
       ,r.chk_end_date
       ,r.chk_detail
       ,r.chk_result
       ,r.eqi_stat
       ,COALESCE(r.note, '내용없음')
FROM   eqir_tbl as r
LEFT JOIN eq_tbl as e
ON r.eq_code = e.eq_code
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

const selectEqiType = `
SELECT c.eq_type
       ,c.chk_text
       ,c.chk_mth
       ,c.range_top
       ,c.range_bot
       ,c.unit
       ,c.jdg_mth
FROM eqi_type_tbl AS c
LEFT JOIN eq_tbl AS e
ON e.eq_type = c.eq_type
WHERE e.eq_type = ?;
`;

module.exports = {
  // 전체 조회 (첫 화면용)
  selectEqList: BASE_QUERY + ' ORDER BY eq_code',

  selectEqiiList: BASE_QUERY_FOR_EQII + ' ORDER BY eqii_code',

  selectEqirList: BASE_QUERY_FOR_EQIR + ' WHERE eqii_code = ?',

  // 동적 검색 (검색 조건 유무에 따라 전체, 조건부 검색)
  buildSearch: buildSearch,

  // 기본 조회
  selectEqByCode: BASE_QUERY + ' WHERE eq_code = ?',

  // 설비 등록 쿼리
  insertEq: `
    INSERT INTO eq_tbl (eq_code, eq_name, eq_model, eq_maker, capacity, stat, eq_make_date, bring_date, take_date, eq_pos, eq_type, is_used)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  // 설비 수정 쿼리
  updateEq: `
    UPDATE eq_tbl 
    SET eq_name = ?, eq_model = ?, eq_maker = ?, capacity = ?, stat = ?, eq_make_date = ?, bring_date = ?, take_date = ?, eq_pos = ?, eq_type = ?, is_used = ?
    WHERE eq_code = ?
  `,

  // 설비 삭제 쿼리
  deleteEq: `
    DELETE FROM eq_tbl 
    WHERE eq_code = ?
  `,

  selectEqCodeForUpdate: selectEqCodeForUpdate,
  selectEqiType: selectEqiType
};