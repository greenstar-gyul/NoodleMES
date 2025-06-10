// src/service/OrderService.js

const orders = [
  {
    ord_code: 'MES00123',
    ord_date: '2025.05.26',
    ord_name: '예담 신라면외 2건',
    client_name: '예담',
    manager: '김철수',
    note: '비고입니다1',
    products: [
      {
        id: 1,
        prod_name: '신라면',
        prod_type: '봉지라면',
        spec: '40',
        unit: 'ea',
        prod_qtt: 10,
        prod_price: 800,
        delivery_date: '2025-05-30',
        priority: 1,
        total_price: 8000
      },
      {
        id: 2,
        prod_name: '짜파게티',
        prod_type: '봉지라면',
        spec: '20',
        unit: 'box',
        prod_qtt: 5,
        prod_price: 12000,
        delivery_date: '2025-05-30',
        priority: 2,
        total_price: 60000
      }
    ]
  },
  {
    ord_code: 'MES00127',
    ord_date: '2025.05.26',
    ord_name: '라면이조아 신라면외 1건',
    client_name: '라면이조아',
    manager: '이영희',
    note: '비고입니다2',
    products: [
      {
        id: 3,
        prod_name: '너구리',
        prod_type: '컵라면(대)',
        spec: '16',
        unit: 'ea',
        prod_qtt: 15,
        prod_price: 1000,
        delivery_date: '2025-05-31',
        priority: 1,
        total_price: 15000
      }
    ]
  },
  {
    ord_code: 'MES00124',
    ord_date: '2025.05.26',
    ord_name: '카모',
    client_name: '카모',
    manager: '박민수',
    note: '비고입니다3',
    products: []
  },
  {
    ord_code: 'MES00125',
    ord_date: '2025.05.26',
    ord_name: '지니스라면',
    client_name: '지니스라면',
    manager: '김철수',
    note: '비고입니다4',
    products: []
  },
  {
    ord_code: 'MES00126',
    ord_date: '2025.05.26',
    ord_name: '라면프레쉬',
    client_name: '라면프레쉬',
    manager: '이영희',
    note: '비고입니다5',
    products: []
  }
];

export default orders;
