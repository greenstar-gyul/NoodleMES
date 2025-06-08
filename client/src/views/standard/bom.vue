<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <!-- 주문번호 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">제품코드</label>
                <InputText v-model="search.prod_code" class="flex-1" />
            </div>

            <!-- 주문명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">제품명</label>
                <InputText v-model="search.prod_name" class="flex-1" />
            </div>

            <!-- 납기일 (범위) -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">등록일자</label>
                <div class="flex items-center flex-1 gap-2">
                    <Calendar v-model="search.regdate_from" class="flex-1" dateFormat="yy-mm-dd" />
                    <span>~</span>
                    <Calendar v-model="search.regdate_to" class="flex-1" dateFormat="yy-mm-dd" />
                </div>
            </div>

            <!-- 상태 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">사용여부</label>
                <Dropdown v-model="search.is_used1" :options="orderStatusOptions" optionLabel="label" optionValue="value" placeholder="" class="flex-1" />
            </div>
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
        <div class="space-y-6" style="width: 55%">
            <!-- 검색결과 테이블 -->
            <TableWDE :data="products" :dataKey="'prod_code'" :mapper="bomMapper"/>

            <!-- 하위자재 구성 테이블 -->
            <EditableTable :fields="['mat_code', 'mat_name', 'mat_type','req_qtt','unit','loss_rate']" 
            :mapper="{ mat_code: '자재코드', mat_name: '자재명', mat_type: '자재유형', req_qtt: '소요수량',
            unit : '단위',loss_rate : '손실율' }" 
            dataKey="id"
             @update="handleUpdate" 
             title="생산계획상세" 
             scrollHeight="250px"/>
        </div>

        <!-- 우측: 제품 등록 영역 (45%) -->
        <StandardInputForm />
    </div>

    <!-- <MultiplePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></MultiplePopup> -->
    <SinglePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></SinglePopup>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import StandardInputForm from '@/components/form/StandardInputForm.vue';
import TableWDE from '@/components/form/TableWithDelExcel.vue';
import TableWAD from '@/components/form/TableWithAddDel.vue';
import bomMapper from '@/service/BOMMapping.js';
import bomSubMapper from '@/service/BOMSubMapping.js';
import MultiplePopup from '@/components/popup/MultiplePopup.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import EditableTable from '@/components/form/EditableTable.vue';

// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    prod_code: '',
    prod_name: '',
    regdate_from: null,
    regdate_to: null,
    is_used: ''
});

// 팝업창 Open/Close 변수
const dialogVisible = ref(false);

// 주문상태 옵션 (예시 데이터)
const orderStatusOptions = [
    { label: '활성', value: 'a1' },
    { label: '비활성', value: 'a2' }
];

// 조회 버튼 기능 (API 호출 자리)
const fetchOrders = () => {
    console.log('조회 실행:', search.value);
    // TODO: 실제 API 호출로 데이터 갱신
};

// 초기화 버튼 기능
const resetSearch = () => {
    search.value = {
        prod_code: '',
        prod_name: '',
        regdate_from: null,
        regdate_to: null,
        is_used: ''
    };
};

// 테이블에 보여줄 제품 데이터 (예시 데이터)
const products = ref([
    {
        prod_code: 'WH001',
        prod_name: '신라면',
        edate: '150일',
        regdate: '2025.06.06',
        is_used: '활성'
    },
    {
        prod_code: 'WH002',
        prod_name: '짜파게티',
        edate: '150일',
        regdate: '2025.06.07',
        is_used: '활성'
    },
    {
        prod_code: 'WH003',
        prod_name: '진진라면',
        edate: '150일',
        regdate: '2025.06.01',
        is_used: '비활성'
    }
]);

const mats = ref([
    {
        mat_code: 'RM001',
        mat_name: '밀가루',
        mat_type: '원자재',
        req_qtt: '1t',
        spec: '100g',
        loss_rate: '0.5%'
    },
    {
        mat_code: 'RM002',
        mat_name: '스프',
        mat_type: '원자재',
        req_qtt: '660kg',
        spec: '20g',
        loss_rate: '0.5%'
    },
    {
        mat_code: 'RM003',
        mat_name: '비닐포장지',
        mat_type: '부자재',
        req_qtt: '1000EA',
        spec: '100mm',
        loss_rate: '-'
    }
]);

const submats = ref([
    {
        mat_code: 'RM004',
        mat_name: '식용유',
        mat_type: '원자재',
        req_qtt: '50L',
        spec: '500ml',
        loss_rate: '0.5%'
    },
    {
        mat_code: 'RM005',
        mat_name: '컵용기',
        mat_type: '부자재',
        req_qtt: '1000EA',
        spec: '60g',
        loss_rate: '-'
    },
    {
        mat_code: 'RM006',
        mat_name: '포장박스',
        mat_type: '부자재',
        req_qtt: '200EA',
        spec: '450mm x 300mm x 300mm',
        loss_rate: '-'
    }
]);

const openPopup = () => {
    dialogVisible.value = true;
}

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
