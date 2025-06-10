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
            <SearchDropdown label="거래처" v-model="search.client_name" :options="clientOptions">
            </SearchDropdown>

            <!-- 수량 (범위) -->
            <SearchCountBetween label="수량" v-model:from="search.prod_qtt_from" v-model:to="search.prod_qtt_to" />

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
    client_name: '',
    prod_qtt_from: null,
    prod_qtt_to: null,
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
        client_name: '',
        prod_qtt_from: null,
        prod_qtt_to: null,
        delivery_date_from: null,
        delivery_date_to: null,
        ord_status: ''
    };

    orderdata.value = OrderData;
};


// 조회 버튼 기능 (API 호출 자리)
const fetchOrders = () => {
    console.log('조회 실행:', search.value);

    orderdata.value = OrderData.filter(item => {
        // 주문코드 체크
        const matchCode = !search.value.ord_code || item.ord_code.includes(search.value.ord_code);

        // 주문명 체크
        const matchName = !search.value.ord_name || item.ord_name.includes(search.value.ord_name);

        // 거래처 체크
        const matchClient = !search.value.client_name || item.client_name === search.value.client_name;

        // 상태 체크
        const matchStatus = !search.value.ord_status || item.ord_status === search.value.ord_status;

        // 주문일자 비교용 Date 객체로 변환
        const ordDate = new Date(item.ord_date);
        const matchOrdDate = 
            (!search.value.ord_date_from && !search.value.ord_date_to) ||
            ((!search.value.ord_date_from || ordDate >= search.value.ord_date_from) &&
             (!search.value.ord_date_to || ordDate <= search.value.ord_date_to));

        // 납기일자 비교용 Date 객체로 변환
        const deliveryDate = new Date(item.delivery_date);
        const matchDeliveryDate = 
            (!search.value.delivery_date_from && !search.value.delivery_date_to) ||
            ((!search.value.delivery_date_from || deliveryDate >= search.value.delivery_date_from) &&
             (!search.value.delivery_date_to || deliveryDate <= search.value.delivery_date_to));

        // 수량 체크 (item.quantity는 '50000개' 처럼 되어 있어서 숫자만 추출 필요)
        const itemQty = parseInt(item.prod_qtt.replace(/[^\d]/g, '')) || 0;
        const qtyFrom = search.value.prod_qtt_from ? parseInt(search.value.prod_qtt_from) : null;
        const qtyTo = search.value.prod_qtt_to ? parseInt(search.value.prod_qtt_to) : null;

        const matchQty = (!qtyFrom && !qtyTo) || (
            (!qtyFrom || itemQty >= qtyFrom) &&
            (!qtyTo || itemQty <= qtyTo)
        );

        // 최종 결과
        return matchCode && matchName && matchClient && matchStatus && matchOrdDate && matchDeliveryDate && matchQty;
    });
};




</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
