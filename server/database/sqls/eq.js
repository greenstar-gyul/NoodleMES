// 조건없이 전체조회

const BASE_QUERY = `
SELECT   eq_code
         , eq_name
         , eq_model
         , eq_maker
         , capacity
         , stat
         , eq_make_date
         , bring_date
         , take_date
         , eq_pos
         , eq_type
         , is_used
FROM     eq_tbl
`;


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

  // 사용여부 (부분 검색)
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

module.exports = {
  // 전체 조회 (첫 화면용)
  selectEqList: BASE_QUERY + ' ORDER BY eq_code',

  // 동적 검색 (검색 조건 유무에 따라 전체, 조건부 검색)
  buildSearch: buildSearch,

  // 기본 
  selectEqByCode: BASE_QUERY + ' WHERE eq_code = ?',

  insertEq: `
    INSERT INTO eq_tbl (eq_code
         , eq_name
         , eq_model
         , eq_maker
         , capacity
         , stat
         , eq_make_date
         , bring_date
         , take_date
         , eq_pos
         , eq_type
         , is_used)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  updateEq: `
    UPDATE eq_tbl 
    SET eq_name = ?
        , eq_model = ?
        , eq_maker = ?
        , capacity = ?
        , stat = ?
        , eq_make_date = ?
        , bring_date = ?
        , take_date = ?
        , eq_pos = ?
        , eq_type = ?
        , is_used = ?
    WHERE eq_code = ?
  `,

  deleteEq: `
    DELETE FROM eq_tbl 
    WHERE eq_code = ?
  `
};