<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <!-- 설비코드 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">점검항목코드</label>
                <InputText v-model="search.prod_code" class="flex-1" />
            </div>

            <!-- 설비명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">설비유형</label>
                <InputText v-model="search.prod_name" class="flex-1" />
            </div>

            <!-- 설비명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">항목명</label>
                <InputText type="text" class="w-full" />
            </div>

            <!-- 상태 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">점검방법</label>
                <Dropdown v-model="search.is_used1" :options="orderStatusOptions" optionLabel="label"
                    optionValue="value" placeholder="" class="flex-1" />
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
            <TableWDE style="margin-bottom:0px; height:730px" :data="products" :dataKey="'eq_code'"
                :mapper="eqMapper" />
        </div>

        <!-- 우측: 제품 등록 영역 (45%) -->
        <StandardInputForm />
    </div>

    <!-- <MultiplePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></MultiplePopup> -->
    <SinglePopup v-model:visible="dialogVisible" :items="clients" @confirm="handleConfirm" :mapper="clientMapper"
        :dataKey="'client_code'"></SinglePopup>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import StandardInputForm from '@/views/standard/components/EqSpecInputForm.vue';
import TableWDE from '@/components/form/TableWithDelExcel.vue';
import TableWAD from '@/components/form/TableWithAddDel.vue';
import bomMapper from '@/service/BOMMapping.js';
import bomSubMapper from '@/service/BOMSubMapping.js';
import eqMapper from '@/service/EquipmentMapping.js';
import MultiplePopup from '@/components/popup/MultiplePopup.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';

// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    prod_code: '',
    prod_name: '',
    regdate_from: null,
    regdate_to: null,
    is_used: ''
});

const openPopup = () => {
    dialogVisible.value = true;
}

// 팝업
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
        eq_code: '',
        eq_name: '',
        eq_model: '',
        eq_maker: '',
        eq_make_date: '',
        bring_date: '',
        chk_cycle: '',
        is_used: ''
    };
};

// 테이블에 보여줄 제품 데이터 (예시 데이터)
const products = ref([
    {
        eq_code: 'EQ001',
        eq_name: '자동면발기A',
        eq_model: 'NOODLE-2023A',
        eq_maker: '한국기계',
        chk_cycle: '30',
        is_used: '활성'
    },
    {
        eq_code: 'EQ002',
        eq_name: '자동면발기B',
        eq_model: 'NOODLE-2023B',
        eq_maker: '한국기계',
        chk_cycle: '30',
        is_used: '활성'
    },
    {
        eq_code: 'EQ003',
        eq_name: '자동면발기C',
        eq_model: 'NOODLE-2023C',
        eq_maker: '한국기계',
        chk_cycle: '30',
        is_used: '활성'
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


</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
