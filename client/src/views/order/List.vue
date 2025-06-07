<template>
    <!-- 🔍 검색바 영역 -->
    <SearchBar></SearchBar>

    <!-- 📋 검색 조회 테이블 영역 -->
    <TableList :data="products" :dataKey="'ord_code'" :mapper="orderMapper"></TableList>
</template>

<script setup>
import { ref } from 'vue';
import TableList from '@/components/form/TableWithExcel.vue';
import SearchBar from '@/components/form/SearchBarExample.vue';
import orderMapper from '@/service/OrderMapping.js';

const searchTitle = ref([
    '주문번호', '주문명', '주문일자', '거래처', '수량', '납기일', '상태'
])

// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    ord_code: '',
    ord_name: '',
    ord_date_from: null,
    ord_date_to: null,
    client: '',
    qty_from: '',
    qty_to: '',
    delivery_date_from: null,
    delivery_date_to: null,
    ord_status: ''
});

// 거래처 옵션 (예시 데이터)
const clientOptions = [
    { label: 'ABC식품', value: 'C001' },
    { label: 'XYZ마트', value: 'C002' }
];

// 주문상태 옵션 (예시 데이터)
const orderStatusOptions = [
    { label: '주문전달', value: 'a1' },
    { label: '생산대기', value: 'a2' },
    { label: '생산중', value: 'a3' },
    { label: '출하시작', value: 'a4' },
    { label: '출하완료', value: 'a5' },
    { label: '주문취소', value: 'a6' },
    { label: '생산중단', value: 'a7' }
];

// 조회 버튼 기능 (API 호출 자리)
const fetchOrders = () => {
    console.log('조회 실행:', search.value);
    // TODO: 실제 API 호출로 데이터 갱신
};

// 초기화 버튼 기능
const resetSearch = () => {
    search.value = {
        ord_code: '',
        ord_name: '',
        ord_date_from: null,
        ord_date_to: null,
        client: '',
        qty_from: '',
        qty_to: '',
        delivery_date_from: null,
        delivery_date_to: null,
        ord_status: ''
    };
};

// 테이블에 보여줄 제품 데이터 (예시 데이터)
const products = ref([
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
]);

// DataTable 선택된 행 (선택 모드)
const selectedProducts = ref();
</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
