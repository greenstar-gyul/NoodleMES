// src/service/ProductService.js

export const productColumns = [
    { field: 'prodName', header: '제품명' },
    { field: 'type', header: '유형' },
    { field: 'quantity', header: '수량' },
    { field: 'price', header: '단가' },
    { field: 'deadline', header: '납기일' },
    { field: 'priority', header: '우선순위' },
    { field: 'totalPrice', header: '총액' },
];

export const productData = [
    {
        prodName: '신라면',
        type: '봉지라면',
        quantity: 10,
        price: 1000,
        deadline: '2025.06.05',
        priority: 1,
        totalPrice: 10000,
    },
    {
        prodName: '진라면',
        type: '봉지라면',
        quantity: 20,
        price: 900,
        deadline: '2025.06.05',
        priority: 1,
        totalPrice: 18000,
    },
];
