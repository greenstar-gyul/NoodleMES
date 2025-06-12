const selectList =
`SELECT mpr_code
        , reqdate
        , deadline
        , mrp_code
        , mcode
FROM mpr_tbl
ORDER BY mpr_code`;

module.exports = {
    selectList,
}