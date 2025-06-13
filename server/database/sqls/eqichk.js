const BASE_QUERY = `
SELECT   chk_type_code
       , eq_type
       , chk_text
       , chk_mth
       , range_top
       , range_bot
       , unit
       , jdg_mth
       , regdate
       , crrdate
       , note
FROM     eqi_type_tbl
`;

const searchEqiChkType = BASE_QUERY + `    
    WHERE 1=1
      AND (? IS NULL OR chk_type_code LIKE CONCAT('%', ?, '%'))
      AND (? IS NULL OR eq_type LIKE CONCAT('%', ?, '%'))
      AND (? IS NULL OR chk_text LIKE CONCAT('%', ?, '%'))
      AND (? IS NULL OR chk_mth LIKE CONCAT('%', ?, '%'))
    ORDER BY chk_type_code;
  `;

const selectEqiChkCodeForUpdate = `
SELECT CONCAT(
    'CHK-', ?, '-',
    LPAD(COALESCE(MAX(SUBSTR(chk_type_code, -3)), 0) + 1, 3, '0')
) AS next_chk_type_code
FROM eqi_type_tbl
WHERE eq_type = ?
  AND chk_type_code LIKE CONCAT('CHK-', ?, '-%')
FOR UPDATE
`;

module.exports = {
    // 전체 조회 (첫 화면용)
    selectEqiChkTypeList: BASE_QUERY + ' ORDER BY chk_type_code',

    // 기본 조회
    selectEqiChkTypeByCode: BASE_QUERY + ' WHERE chk_type_code = ?',

    searchEqiChkType: searchEqiChkType,

    // 설비 등록 쿼리
    insertEqiChkType: `
    INSERT INTO eqi_type_tbl (chk_type_code, eq_type, chk_text, chk_mth, range_top, range_bot, unit, jdg_mth, regdate, crrdate, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

    // 설비 수정 쿼리
    updateEqiChkType: `
    UPDATE eqi_type_tbl 
    SET eq_type = ?, chk_text = ?, chk_mth = ?, range_top = ?, range_bot = ?, unit = ?, jdg_mth = ?, regdate = ?, crrdate = ?, note = ?
    WHERE chk_type_code = ?
  `,

    // 설비 삭제 쿼리
    deleteEqiChkType: `
    DELETE FROM eqi_type_tbl 
    WHERE chk_type_code = ?
  `,

    selectEqiChkCodeForUpdate: selectEqiChkCodeForUpdate
};