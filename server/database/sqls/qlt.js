const selectList =
`SELECT 
    qio.qio_code,
    qio.prod_name,
    qio.qio_date,
    qio.insp_emp_code,
    qi.note
FROM 
    quality_inspection_order qio
JOIN 
    quality_inspection qi ON qio.qi_code = qi.qi_code
WHERE 
    qio.pname = ?;`;

module.exports = {
    selectList,
}