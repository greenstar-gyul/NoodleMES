<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">라인</label>
                <InputText v-model="search.ord_name" class="flex-1" />
            </div>

            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">검사명</label>
                <InputText v-model="search.ord_name" class="flex-1" />
            </div>

            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">검사유형</label>
                <Dropdown v-model="search.client" :options="clientOptions" optionLabel="label" optionValue="value"
                    placeholder="" class="flex-1" />
            </div>
            
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">검사구분</label>
                <Dropdown v-model="search.client" :options="clientOptions" optionLabel="label" optionValue="value"
                    placeholder="" class="flex-1" />
            </div>

            <SearchDate label="검사일자" v-model="search.reg_date" dateFormat="yy-mm-dd" class="flex-1"/>

            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">제품명</label>
                <InputText v-model="search.ord_name" class="flex-1" />
            </div>

            <SearchDropdown label="결과" v-model="search.ord_status" :options="orderStatusOptions">
            </SearchDropdown>
        </div>

        <!-- 조회/초기화 버튼 영역 -->
        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchOrders" />
        </div>
    </div>

  <!-- 📋 검색 조회 테이블 영역 -->
  <div class="flex flex-col lg:flex-row gap-6 mt-6">
    <!-- 좌측: 검색결과 + 하위자재 구성 (50%) -->
    <div class="space-y-6" style="width: 100%">
      <!-- 검색결과 테이블 -->
      <EqIITable style="margin-bottom:0px; height:730px" :data="products" :dataKey="'eqii_code'" :mapper="eqiiMapper" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import QualityMapping from '../../../service/QualityMapping';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import SearchText from '../../../components/search-bar/SearchText.vue';
import SearchDateBetween from '../../../components/search-bar/SearchDateBetween.vue';
import SearchDate from '../../../components/search-bar/SearchDate.vue';
import SearchCountBetween from '../../../components/search-bar/SearchCountBetween.vue';
import SearchDropdown from '../../../components/search-bar/SearchDropdown.vue';


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
</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>