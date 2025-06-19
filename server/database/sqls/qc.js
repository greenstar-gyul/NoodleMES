const = selectAllQIO: `
SELECT
        qio_code,
        prod_code,
        client,
        manager,
        po_code,
        ord_date
FROM quality_inspection_orders
`;

const = selectAllQIR: `
SELECT eqir_code, eq_name, chk_start_date, chk_end_date, chk_detail, note, chk_result, eqi_stat
FROM quality_inspection_results
`;


module.exports = {
  selectAllQIO,
  selectAllQIR
};