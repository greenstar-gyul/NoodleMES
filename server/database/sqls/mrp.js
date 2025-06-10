// 조건없이 전체조회
const selectMRPList = `
SELECT   mrp_code
FROM     mrp_tbl
ORDER BY mrp_code
`;

module.exports = {
    selectMRPList,
}