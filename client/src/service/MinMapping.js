

export const minbndMapping = {
  minbnd_code: '자재입고코드',
  mat_code: '자재명', 
  mat_name: '자재명', 
  material_type_code: '자재유형코드',
  comm_mat_type: '자재유형',
  unit: '단위코드',
  comm_unit: '단위',
  inbnd_qtt: '입고수량',
  inbnd_date: '입고일자',
  ord_qtt: '주문수량',
  qio_code: '품질검사코드',
  lot_num: 'LOT 번호',
  mat_sup: '공급업체',
  sup_name: '공급업체명',
  emp_code: '담당자 코드',
  emp_name: '담당자 이름',
};

export const matMapping = {
  mat_code: '자재코드',
  mat_name: '자재명',
  unit: '단위',
  mat_type: '자재유형',
  sup_name: '공급업체명'
};

export const qioMapping = {
  qio_code: '품질검사코드',
  qio_date: '검사지시일자',
  mat_code: '자재코드',
  mat_name: '자재명',
  mpr_d_code: '자재구매상세',
  emp_code: '담당자 코드',
  // prdr_code: '자재구매요청상세',
};


export default {
    minbndMapping,
    matMapping,
    qioMapping,
};