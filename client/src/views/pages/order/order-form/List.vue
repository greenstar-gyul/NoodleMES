<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <!-- 주문번호 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">주문번호</label>
                <InputText v-model="search.ord_code" class="flex-1" />
            </div>

            <!-- 주문명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">주문명</label>
                <InputText v-model="search.ord_name" class="flex-1" />
            </div>

            <!-- 주문일자 (범위) -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">주문일자</label>
                <div class="flex items-center flex-1 gap-2">
                    <Calendar v-model="search.ord_date_from" class="flex-1" dateFormat="yy-mm-dd" />
                    <span>~</span>
                    <Calendar v-model="search.ord_date_to" class="flex-1" dateFormat="yy-mm-dd" />
                </div>
            </div>

            <!-- 거래처 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">거래처</label>
                <Dropdown v-model="search.client" :options="clientOptions" optionLabel="label" optionValue="value" placeholder="" class="flex-1" />
            </div>

            <!-- 수량 (범위) -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">수량</label>
                <div class="flex items-center flex-1 gap-2">
                    <InputText v-model="search.qty_from" class="flex-1" />
                    <span>~</span>
                    <InputText v-model="search.qty_to" class="flex-1" />
                </div>
            </div>

            <!-- 납기일 (범위) -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">납기일</label>
                <div class="flex items-center flex-1 gap-2">
                    <Calendar v-model="search.delivery_date_from" class="flex-1" dateFormat="yy-mm-dd" />
                    <span>~</span>
                    <Calendar v-model="search.delivery_date_to" class="flex-1" dateFormat="yy-mm-dd" />
                </div>
            </div>

            <!-- 상태 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">상태</label>
                <Dropdown v-model="search.ord_status" :options="orderStatusOptions" optionLabel="label" optionValue="value" placeholder="" class="flex-1" />
            </div>
        </div>

        <!-- 조회/초기화 버튼 영역 -->
        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchOrders" />
        </div>
    </div>

    <!-- 📋 검색 조회 테이블 영역 -->
    <div class="card mt-6">
        <!-- 테이블 상단 (타이틀 + 엑셀 다운로드 버튼) -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">기본정보</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="엑셀 다운로드" severity="success" class="min-w-fit whitespace-nowrap" />
                </div>
            </div>
        </div>

        <!-- DataTable (PrimeVue) -->
        <DataTable v-model:selection="selectedProducts" :value="products" dataKey="id" tableStyle="min-width: 50rem" showGridlines scrollable scrollHeight="400px">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="ord_code" header="주문번호"></Column>
            <Column field="ord_name" header="주문명"></Column>
            <Column field="ord_date" header="주문일자"></Column>
            <Column field="prod_name" header="제품명"></Column>
            <Column field="quantity" header="수량"></Column>
            <Column field="client" header="거래처"></Column>
            <Column field="delivery_date" header="납기일"></Column>
            <Column field="status" header="상태"></Column>
            <Column field="note" header="비고"></Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

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
