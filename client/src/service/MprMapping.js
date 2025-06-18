export const MprMapper = {
    mpr_code: '구매요청코드',
    reqdate: '요청일자',
    deadline: '납기일자', 
    mrp_code: 'MRP계획번호',
    mcode: '요청자',
    mat_sup: '공급업체',
    note: '비고',
};

export const MatMapper = {
    mat_code: '자재코드',
    mat_name: '자재명',
    save_inven: '재고', 
    unit: '단위',
    mat_sup: '공급업체',
    client_name: '업체명',
    material_type_code: '자재유형',
};

export const MRPMapper = {
    mrp_code: 'MRP 계획번호',
    plan_date: '계획수립일자',
    start_date: '생산시작일', 
    prdp_code: '생산계획코드',
    emp_code: '작성자',
    mrp_note: '비고',
};


export default {
    MprMapper,
    MatMapper,
    MRPMapper,
};
    