<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <!-- 주문번호 -->
            <!-- <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">주문번호</label>
                <InputText v-model="search.ord_code" class="flex-1" />
            </div> -->
            <SearchText v-model="search.ord_code" label="주문코드" placeholder="주문코드를 입력하세요"></SearchText>

            <!-- 주문명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">주문명</label>
                <InputText v-model="search.ord_name" class="flex-1" />
            </div>

            <!-- 주문일자 (범위) -->
            <!-- <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">주문일자</label>
                <div class="flex items-center flex-1 gap-2">
                    <Calendar v-model="search.ord_date_from" class="flex-1" dateFormat="yy-mm-dd" />
                    <span>~</span>
                    <Calendar v-model="search.ord_date_to" class="flex-1" dateFormat="yy-mm-dd" />
                </div>
            </div> -->
            <SearchDateBetween label="주문일자" :from="search.ord_date_from" :to="search.ord_date_to"
                @update:from="search.ord_date_from = $event" @update:to="search.ord_date_to = $event">
            </SearchDateBetween>

            <!-- 거래처 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">거래처</label>
                <Dropdown v-model="search.client" :options="clientOptions" optionLabel="label" optionValue="value"
                    placeholder="" class="flex-1" />
            </div>

            <!-- 수량 (범위) -->
            <!-- <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">수량</label>
                <div class="flex items-center flex-1 gap-2">
                    <InputText v-model="search.qty_from" class="flex-1" />
                    <span>~</span>
                    <InputText v-model="search.qty_to" class="flex-1" />
                </div>
            </div> -->
            <SearchCountBetween label="수량" :from="search.qty_from" :to="search.qty_to"
                @update:from="search.qty_from = $event" @update:to="search.qty_to = $event">
            </SearchCountBetween>

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
            <!-- <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">상태</label>
                <Dropdown v-model="search.ord_status" :options="orderStatusOptions" optionLabel="label"
                    optionValue="value" placeholder="" class="flex-1" />
            </div> -->
            <SearchDropdown label="상태1" v-model="search.ord_status" :options="orderStatusOptions">
            </SearchDropdown>

            <SearchDate label="등록일자" v-model="search.reg_date" dateFormat="yy-mm-dd" class="flex-1"/>

        </div>

        <!-- 조회/초기화 버튼 영역 -->
        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchOrders" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import SearchText from '../search-bar/SearchText.vue';
import SearchDateBetween from '../search-bar/SearchDateBetween.vue';
import SearchDate from '../search-bar/SearchDate.vue';
import SearchCountBetween from '../search-bar/SearchCountBetween.vue';
import SearchDropdown from '../search-bar/SearchDropdown.vue';

const props = defineProps({
    data: {
        type: Array,  // ✅ Object가 아니라 Array로 해야 함 (Array of objects)
        required: true
    },
    dataKey: {
        type: String,
        default: 'id'
    }
});

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
    ord_status: '',
    reg_date: null
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
    // console.log('조회 실행:', search.value);
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
</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
