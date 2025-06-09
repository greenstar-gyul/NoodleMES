// 주문 예시 데이터 모듈
const OrderData = [
    {
        ord_code: 'MES00123',
        ord_name: 'A거래처 스낵면 외 1',        
        prod_name: '스낵면',
        spec:'-',
        unit:'개',
        prod_qtt: '50000',
        client_name: 'A거래처',
        delivery_date: '2025.06.01',
        ord_date: '2025.05.26',
        status: '주문전달',
        note: '특이사항없음.'
    },
    {
        ord_code: 'MES00123',
        ord_name: 'A거래처 스낵면 외 1',        
        prod_name: '진라면',
        spec:'40',
        unit:'Box',
        prod_qtt: '3000',
        client_name: 'A거래처',
        delivery_date: '2025.06.05',
        ord_date: '2025.05.26',
        status: '주문전달',
        note: '특이사항없음.'
    },
    {
        ord_code: 'MES00124',
        ord_name: 'B거래처 신라면',        
        prod_name: '스낵면',
        spec:'20',
        unit:'Box',
        prod_qtt: '40000',
        client_name: 'B거래처',
        delivery_date: '2025.06.02',
        ord_date: '2025.05.27',
        status: '주문전달',
        note: '특이사항없음.'
    },
    {
        ord_code: 'MES00125',
        ord_name: 'C거래처 진라면',        
        prod_name: '진라면',
        spec:'-',
        unit:'개',
        prod_qtt: '30000',
        client_name: 'C거래처',
        delivery_date: '2025.06.07',
        ord_date: '2025.06.01',
        status: '주문전달',
        note: '특이사항없음.'
    }
];

export default OrderData;
