<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <!-- 주문번호 -->
            <SearchText v-model="search.ord_code" label="주문코드" placeholder="주문코드를 입력하세요">
            </SearchText>

            <!-- 주문명 -->
            <SearchText v-model="search.ord_name" label="주문명" placeholder="주문명을 입력하세요">
            </SearchText>

            <!-- 주문일자 (범위) -->
            <SearchDateBetween label="주문일자" :from="search.ord_date_from" :to="search.ord_date_to" @update:from="search.ord_date_from = $event" @update:to="search.ord_date_to = $event">
            </SearchDateBetween>

            <!-- 거래처 -->
            <SearchDropdown label="거래처" v-model="search.client" :options="clientOptions">
            </SearchDropdown>

            <!-- 수량 (범위) -->
            <SearchCountBetween label="수량" v-model:from="search.qty_from" v-model:to="search.qty_to" />

            <!-- 납기일 (범위) -->
            <SearchDateBetween label="납기일" :from="search.delivery_date_from" :to="search.delivery_date_to" @update:from="search.delivery_date_from = $event" @update:to="search.delivery_date_to = $event">
            </SearchDateBetween>

            <!-- 상태 -->
            <SearchDropdown label="상태" v-model="search.ord_status" :options="orderStatusOptions">
            </SearchDropdown>
        </div>

        <!-- 조회/초기화 버튼 영역 -->
        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchOrders" />
        </div>
    </div>


    <!-- 📋 검색 조회 테이블 영역 -->
    <TableList :data="orderdata" :dataKey="'ord_code'" :mapper="orderMapper" title="검색결과"></TableList>
    <!-- 빈 데이터일 때 메시지 표시 -->
    <div v-if="orderdata.length === 0" class="text-center text-gray-500 mt-4">
        조건에 맞는 데이터가 없습니다.
    </div>
</template>

<script setup>
import { ref } from 'vue';
import TableList from '@/components/form/TableWithExcel.vue';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';
import SearchDropdown from '@/components/search-bar/SearchDropdown.vue';
import SearchCountBetween from '@/components/search-bar/SearchCountBetween.vue';

import orderMapper from '@/service/OrderMapping.js';
import OrderData from '@/service/OrderData.js';
import ClientOptions from '@/service/ClientOptions.js';
import OrderStatusOptions from '@/service/OrderStatusOptions.js';

const orderdata = ref(OrderData);
const clientOptions = ref(ClientOptions);
const orderStatusOptions = ref(OrderStatusOptions);


// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    ord_code: '',
    ord_name: '',
    ord_date_from: null,
    ord_date_to: null,
    client: '',
    qty_from: null,
    qty_to: null,
    delivery_date_from: null,
    delivery_date_to: null,
    ord_status: ''
});


// 초기화 버튼 기능
const resetSearch = () => {
    search.value = {
        ord_code: '',
        ord_name: '',
        ord_date_from: null,
        ord_date_to: null,
        client: '',
        qty_from: null,
        qty_to: null,
        delivery_date_from: null,
        delivery_date_to: null,
        ord_status: ''
    };

    orderdata.value = OrderData;
};


// 조회 버튼 기능 (API 호출 자리)
const fetchOrders = () => {
    console.log('조회 실행:', search.value);

    // 날짜를 안전하게 "YYYY-MM-DD" 형식으로 변환
    const formatDate = (date) => {
        if (!date) return '';
        if (typeof date === 'string') return date;  // 이미 문자열이면 그대로 사용
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 프론트에서 필터링
    orderdata.value = OrderData.filter(item => {
        // 주문코드 체크
        const matchCode = search.value.ord_code === '' || item.ord_code.includes(search.value.ord_code);

        // 주문명 체크
        const matchName = search.value.ord_name === '' || item.ord_name.includes(search.value.ord_name);

        // 거래처 체크
        const matchClient = search.value.client === '' || item.client === search.value.client;

        // 상태 체크
        const matchStatus = search.value.ord_status === '' || item.status === search.value.ord_status;

        // 주문일자 체크 (범위 → 안전한 방식)
        const ordDate = formatDate(item.ord_date);
        const ordDateFrom = formatDate(search.value.ord_date_from);
        const ordDateTo = formatDate(search.value.ord_date_to);

        const matchOrdDate = 
            (!ordDateFrom || ordDate >= ordDateFrom) &&
            (!ordDateTo || ordDate <= ordDateTo);

        // 납기일자 체크 (범위 → 안전한 방식)
        const deliveryDate = formatDate(item.delivery_date);
        const deliveryDateFrom = formatDate(search.value.delivery_date_from);
        const deliveryDateTo = formatDate(search.value.delivery_date_to);

        const matchDeliveryDate = 
            (!deliveryDateFrom || deliveryDate >= deliveryDateFrom) &&
            (!deliveryDateTo || deliveryDate <= deliveryDateTo);

        // 수량 체크 (item.quantity는 '50000개' 처럼 되어 있어서 숫자만 추출 필요)
        const itemQty = parseInt(item.quantity.replace(/[^\d]/g, '')) || 0;
        const qtyFrom = search.value.qty_from ? parseInt(search.value.qty_from) : null;
        const qtyTo = search.value.qty_to ? parseInt(search.value.qty_to) : null;

        const matchQty = (!qtyFrom && !qtyTo) || (
            (!qtyFrom || itemQty >= qtyFrom) &&
            (!qtyTo || itemQty <= qtyTo)
        );

        // 최종 결과 → 모든 조건이 true여야 통과
        return matchCode && matchName && matchClient && matchStatus && matchOrdDate && matchDeliveryDate && matchQty;
    });
};



</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
