// 주문 예시 데이터 모듈
const OrderData = [
    {
        ord_code: 'MES00123',
        ord_name: 'A거래처 스낵면 외 1',
        ord_date: '2025.05.26',
        prod_name: '스낵면',
        quantity: '50000개',
        client: 'A거래처',
        delivery_date: '2025.06.01',
        status: '주문전달',
        note: '특이사항없음.'
    },
    {
        ord_code: 'MES00124',
        ord_name: 'B거래처 신라면',
        ord_date: '2025.05.27',
        prod_name: '스낵면',
        quantity: '40000개',
        client: 'B거래처',
        delivery_date: '2025.06.02',
        status: '주문전달',
        note: '특이사항없음.'
    },
    {
        ord_code: 'MES00125',
        ord_name: 'C거래처 진라면',
        ord_date: '2025.06.01',
        prod_name: '진라면',
        quantity: '30000개',
        client: 'C거래처',
        delivery_date: '2025.06.07',
        status: '주문전달',
        note: '특이사항없음.'
    }
];

export default OrderData;
