export const mats = [
  {
    mat_code: "MAT-001",
    mat_name: "밀가루",
    unit: "kg",
    req_qtt: 150,
    cur_qtt: 200,
    plan_date: "2025-06-10",
    proposal_date: "2025-06-08",
    mrp_status: "충분",
    prdp_code: "PRDP-202505-123",
  },
  {
    mat_code: "MAT-002",
    mat_name: "스프",
    unit: "kg",
    req_qtt: 80,
    cur_qtt: 200,
    plan_date: "2025-06-12",
    proposal_date: "2025-06-09",
    mrp_status: "충분",
    prdp_code: "PRDP-202505-123",
  },
  {
    mat_code: "MAT-003",
    mat_name: "건더기 스프",
    unit: "kg",
    req_qtt: 120,
    cur_qtt: 200,
    plan_date: "2025-06-11",
    proposal_date: "2025-06-08",
    mrp_status: "충분",
    prdp_code: "PRDP-202506-001",
  },
  {
    mat_code: "MAT-004",
    mat_name: "용기",
    unit: "EA",
    req_qtt: 1000,
    cur_qtt: 200,
    plan_date: "2025-06-13",
    proposal_date: "2025-06-10",
    mrp_status: "부족",
    prdp_code: "PRDP-202505-123",
  },
  {
    mat_code: "MAT-005",
    mat_name: "뚜껑",
    unit: "EA",
    req_qtt: 1000,
    cur_qtt: 200,
    plan_date: "2025-06-13",
    proposal_date: "2025-06-10",
    mrp_status: "부족",
    prdp_code: "PRDP-202506-001",
  }
];

export const popupMats = [
  {
    mat_code: 'MAT-001',
    mat_name: '밀가루',
    mat_type: '원자재',
    req_qtt: '1t',
    spec: '100g',
    loss_rate: '0.5%'
  },
  {
    mat_code: 'MAT-002',
    mat_name: '스프',
    mat_type: '원자재',
    req_qtt: '660kg',
    spec: '20g',
    loss_rate: '0.5%'
  },
  {
    mat_code: 'MAT-003',
    mat_name: '비닐포장지',
    mat_type: '부자재',
    req_qtt: '1000EA',
    spec: '100mm',
    loss_rate: '-'
  },
  {
    mat_code: 'MAT-004',
    mat_name: '식용유',
    mat_type: '원자재',
    req_qtt: '50L',
    spec: '500ml',
    loss_rate: '0.5%'
  },
  {
    mat_code: 'MAT-005',
    mat_name: '컵용기',
    mat_type: '부자재',
    req_qtt: '1000EA',
    spec: '60g',
    loss_rate: '-'
  },
  {
    mat_code: 'MAT-006',
    mat_name: '포장박스',
    mat_type: '부자재',
    req_qtt: '200EA',
    spec: '450mm x 300mm x 300mm',
    loss_rate: '-'
  }
];

export const prodPlans = [
  {
    prdp_code: "PRDP-202505-123",
    prdp_name: "생산계획1",
    plan_date: "2025-05-27",
    start_date: "2025-06-05",
    end_date: "2025-06-06",
    note: "생산 빨리 해주세요",
  },
  {
    prdp_code: "PRDP-202506-001",
    prdp_name: "생산계획2",
    plan_date: "2025-05-28",
    start_date: "2025-06-15",
    end_date: "2025-06-30",
    note: "생산 빨리 해주세요@@@@",
  },
  {
    prdp_code: "PRDP-202506-002",
    prdp_name: "생산계획3",
    plan_date: "2025-05-29",
    start_date: "2025-06-05",
    end_date: "2025-06-06",
    note: "생산 빨리 해주세요@@",
  },
  {
    prdp_code: "PRDP-202506-003",
    prdp_name: "생산계획4",
    plan_date: "2025-06-01",
    start_date: "2025-06-13",
    end_date: "2025-06-26",
    note: "생산 빨리 해주세요@@@@",
  },
  {
    prdp_code: "PRDP-202506-004",
    prdp_name: "생산계획5",
    plan_date: "2025-06-04",
    start_date: "2025-06-07",
    end_date: "2025-06-11",
    note: "생산 빨리 해주세요@@@@@@@",
  },
];

export default { popupMats, mats, prodPlans };