<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <!-- 지시코드 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">지시코드</label>
                <InputText v-model="search.qio_code" class="flex-1" />
            </div>

            <!-- 공정명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">공정명</label>
                <InputText v-model="search.pname" class="flex-1" />
            </div>

            <!-- 제품명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">제품명</label>
                <InputText v-model="search.prod_name" class="flex-1" />
            </div>
            
            <!-- LOT번호 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">LOT번호</label>
                <InputText v-model="search.prod_code" class="flex-1" />
            </div>
            
            <!-- 검사기간 -->
            <div class="flex items-center gap-3 w-full">
                <SearchDateBetween label="검사기간" :from="search.start_date" :to="search.end_date"
                    @update:from="search.start_date = $event" @update:to="search.end_date = $event">
                </SearchDateBetween>
            </div>
            <!-- 검사유형 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">지시자</label>
                <Dropdown v-model="search.insp_emp_code" :options="orderStatusOptions" optionLabel="label" optionValue="value" placeholder="" class="flex-1" />
            </div>
        </div>

        <!-- 조회/초기화 버튼 영역 -->
        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchLists" />
        </div>
    </div>

    <!-- 📋 검색 조회 테이블 영역 -->
    <div class="flex flex-col lg:flex-row gap-6 mt-6">
        <!-- 좌측: 검색결과 + 하위자재 구성 (50%) -->
        <div class="space-y-6" style="width: 100%">
            <TableWDE :data="qualitys" :dataKey="'qio_code'" :mapper="QualityMapping"/>
        </div>


    <!-- <MultiplePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></MultiplePopup> -->
    <SinglePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></SinglePopup>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';

import QualityInputForm from '../../../components/form/QualityInputForm.vue';
import TableWDE from '@/components/form/TableWithDelExcel.vue';
import TableWAD from '@/components/form/TableWithAddDel.vue';
import QualityMapping from '@/service/QualityMapping';
import MultiplePopup from '@/components/popup/MultiplePopup.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';


// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    qio_code: '',
    pname: '',
    prod_name: '',
    prod_code: '',
    start_date: null,
    end_date: null,
    insp_emp_code: ''
});

// 팝업창 Open/Close 변수
const dialogVisible = ref(false);

// 주문상태 옵션 (예시 데이터)
const orderStatusOptions = [

    { label: '수동', value: 'a1' },
    { label: '자동', value: 'a2' }

];

// 조회 버튼 기능 (API 호출 자리)
const fetchLists = async () => {
    console.log('조회 실행:', search.value);
    // TODO: 실제 API 호출로 데이터 갱신
     try {
        const params = { ...search.value };

        // 필요시 날짜 변환 처리
        if (params.start_date instanceof Date)
            params.start_date = params.start_date.toISOString().slice(0, 10);
        if (params.end_date instanceof Date)
            params.end_date = params.end_date.toISOString().slice(0, 10);

        const response = await axios.get('/api/quality/search', { params });
        qualitys.value = response.data;
        console.log('qualitys.value');
        console.log(qualitys.value);
    } catch (error) {
        console.error('조회 실패:', error);
    }
};

// 초기화 버튼 기능
const resetSearch = () => {
    search.value = {
        prod_code: '',
        lot_code : '',
        start_date: null,
        end_date: null,
        qio_date: null,
        insp_emp_code: ''
    };
};


// 테이블에 보여줄 목록 데이터 (예시 데이터)
const qualitys = ref([
    {
        qio_code: '검사지시코드1',
        pname: '공정명',
        lot_code: 'LOT번호',
        prod_name: '(검사대상코드)제품명',
        qio_date: '지시일자',
        insp_emp_code: '지시자',
        note: '비고'
    },
    {
        qio_code: '검사지시코드2',
        pname: '공정명',
        lot_code: 'LOT번호',
        prod_name: '(검사대상코드)제품명',
        qio_date: '지시일자',
        insp_emp_code: '지시자',
        note: '비고'
    },
    {
        qio_code: '검사지시코드3',
        pname: '공정명',
        lot_code: 'LOT번호',
        prod_name: '(검사대상코드)제품명',
        qio_date: '지시일자',
        insp_emp_code: '지시자',
        note: '비고'
    },
    {
        qio_code: '검사지시코드4',
        pname: '공정명',
        lot_code: 'LOT번호',
        prod_name: '(검사대상코드)제품명',
        qio_date: '지시일자',
        insp_emp_code: '지시자',
        note: '비고'
    },
    {
        qio_code: '검사지시코드5',
        pname: '공정명',
        lot_code: 'LOT번호',
        prod_name: '(검사대상코드)제품명',
        qio_date: '지시일자',
        insp_emp_code: '지시자',
        note: '비고'
    },
]);



const openPopup = () => {
    dialogVisible.value = true;
}

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
