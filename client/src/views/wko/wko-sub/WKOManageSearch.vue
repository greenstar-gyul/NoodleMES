<script setup>
import { onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import MultiplePopup from '@/components/popup/MultiplePopup.vue';
import WKOSearchPopup from './WKOSearchPopup.vue';
import prodPlanMapping from '../../../service/ProductionPlanMapping';
import LabeledTextarea from '../../../components/registration-bar/LabeledTextarea.vue';
import LabeledInput from '../../../components/registration-bar/LabeledInput.vue';
import LabeledSelect from '../../../components/registration-bar/LabeledSelect.vue';
import axios from 'axios';

const emit = defineEmits(['resetList', 'saveData', 'update:data', 'prodPlanSelected', 'loadWko']);
const props = defineProps({
    data: {
        type: Object,
        required: true
    }
});

onMounted(() => {
    
})

/**
 * 생산 계획 불러오기 팝업 데이터 불러오기
 */
const loadPlansData = async () => {
    try {
        const response = await axios.get(`/api/wko/plan-list`);
        prodPlans.value = await response.data.data;
    }
    catch(err) {
        console.error(err);
    }
}

/**
 * 제품 목록 불러오기
 */
const loadProdData = async () => {
    try {
        const response = await axios.get(`/api/wko/prodlist`);
        products.value = await response.data.data;
    }
    catch(err) {
        console.error(err);
    }
}

/**
 * 작업지시서 목록 불러오기
 */
const loadWKOListData = async () => {
    try {
        const response = await axios.get(`/api/wko/searchMonth`);
        wkoList.value = await response.data.data;
    }
    catch(err) {
        console.error(err);
    }
}

/**
 * 생산 계획 선택
 */
const prdpLoad = async (value) => {
    // 생산 계획 정보만 설정
    const updatedData = {
        ...props.data,
        prdp_code: value.prdp_code,
        // 제품 정보는 별도 선택까지 대기
        prod_code: '',
        prod_name: '',
    };

    emit('update:data', updatedData);
}

/**
 * 제품 선택
 */
const prodLoad = async (values) => {
    if (values && values.length > 0) {
        const selectedProd = values[0]; // 단일 선택
        
        const updatedData = {
            ...props.data,
            prod_code: selectedProd.prod_code,
            prod_name: selectedProd.prod_name,
        };

        emit('update:data', updatedData);
        
        // 생산계획과 제품이 모두 선택되면 공정 목록 로드 요청
        if (updatedData.prdp_code && updatedData.prod_code) {
            emit('prodPlanSelected', updatedData.prdp_code, updatedData.prod_code);
        }
    }
}

/**
 * 기존 작업지시서 선택
 */
const loadExistingWKO = async (value) => {
    emit('loadWko', value.wko_code);
}

const openWKOPopup = async () => {
    await loadWKOListData();
    wkoPopupVisible.value = true;
}

const openPrdpPopup = async () => {
    await loadPlansData();
    prdpPopupVisible.value = true;
}

/**
 * 작업자 선택 팝업 (필요시 구현)
 */
const openEmpPopup = async () => {
    // 작업자 선택 팝업 로직 (필요시 구현)
    alert('작업자 선택 기능은 추후 구현 예정입니다.');
}

const openProdPopup = async () => {
    if (!props.data.prdp_code) {
        alert('먼저 생산계획을 선택하세요.');
        return;
    }
    await loadProdData();
    prodPopupVisible.value = true;
}

const saveWKO = async () => {
    if (!props.data.prdp_code) {
        alert('생산계획을 선택하세요.');
        return;
    }
    if (!props.data.prod_code) {
        alert('제품을 선택하세요.');
        return;
    }
    emit('saveData')
}
const prodPopupVisible = ref(false);
const wkoPopupVisible = ref(false);
const prodPlans = ref([]);
const products = ref([]);
const wkoList = ref([]);

// 제품타입 옵션
const prodTypeOptions = ref([
    { label: '일반', value: '일반' },
    { label: '긴급', value: '긴급' },
    { label: '특별', value: '특별' }
]);

// 작업 상태 옵션
const statOptions = ref([
    { label: '대기', value: '대기' },
    { label: '진행중', value: '진행중' },
    { label: '완료', value: '완료' },
    { label: '중단', value: '중단' }
]);

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>

<template>
    <!-- 작업지시서 등록/수정 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl"><b>작업 지시서 관리</b></div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="삭제" severity="danger" class="min-w-fit" />
                    <Button label="초기화" severity="contrast" class="min-w-fit" v-on:click="emit('resetList')" />
                    <Button label="저장" severity="info" class="min-w-fit" v-on:click="saveWKO" />
                    <Button label="작업지시서 불러오기" severity="success" @click="openWKOPopup" />
                </div>
            </div>
        </div>

        <!-- 작업지시서 정보 -->
        <div class="bg-white p-4 rounded border">

            <!-- 첫 번째 행: 코드 정보 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LabeledInput label="작업지시코드" :model-value="data.wko_code" :disabled="true"
                    placeholder="저장 시 자동으로 생성됩니다." />
                <div class="flex gap-2">
                    <LabeledInput label="생산계획코드" :model-value="data.prdp_code" :disabled="true" class="flex-1" />
                    <Button icon="pi pi-search" @click="openPrdpPopup" />
                </div>
                <LabeledInput label="작업시작일" v-model="data.start_date" type="date" />
            </div>
            
            <!-- 두 번째 행: 작업 정보 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div class="flex gap-2">
                    <LabeledInput label="작업자" :model-value="data.emp_name" :disabled="true" class="flex-1" />
                    <Button icon="pi pi-user" @click="openEmpPopup" />
                </div>
                <div class="flex gap-2">
                    <LabeledInput label="제품" :model-value="data.prod_name" :disabled="true" class="flex-1" />
                    <Button icon="pi pi-search" @click="openProdPopup" />
                </div>
                <LabeledInput label="생산수량" v-model="data.planned_qtt" type="number" />
            </div>

            <!-- 세 번째 행: 담당자, 비고 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <LabeledSelect label="제품타입" v-model="data.prod_type" :options="prodTypeOptions" />
                <LabeledInput label="지시생성일" :model-value="data.created_date" :disabled="true" />
                <LabeledSelect label="작업상태" v-model="data.stat" :options="statOptions" />
            </div>

            <div class="grid grid-cols-1 gap-4 mt-4">
                <LabeledTextarea label="비고" v-model="data.note" placeholder="특이사항 입력" :rows="2" />
            </div>
        </div>
    </div>

    <!-- 작업지시서 검색 팝업 -->
    <WKOSearchPopup 
        v-model:visible="wkoPopupVisible" 
        @confirm="loadExistingWKO">
    </WKOSearchPopup>

    <!-- 생산계획 선택 팝업 -->
    <SinglePopup v-model:visible="prdpPopupVisible" :items="prodPlans" @confirm="prdpLoad" :mapper="prodPlanMapping"
        :dataKey="'prdp_code'" :placeholder="'생산계획 선택'">
    </SinglePopup>

    <!-- 제품 선택 팝업 -->
    <MultiplePopup v-model:visible="prodPopupVisible" :items="products"
        :selectedHeader="['prod_code', 'prod_name', 'prod_type', 'unit']"
        :mapper="{ 'prod_code': '제품코드', 'prod_name': '제품명', 'prod_type': '제품유형', 'unit': '단위' }" @confirm="prodLoad"
        :dataKey="'prod_code'" :singleSelect="true">
    </MultiplePopup>
</template>