<!-- WKOManageSearch.vue 수정 버전 -->
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

// 필드 업데이트 함수 추가
const updateField = (fieldName, value) => {
    const updatedData = {
        ...props.data,
        [fieldName]: value
    };
    emit('update:data', updatedData);
};

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
    catch (err) {
        console.error(err);
    }
}

/**
 * 제품 목록 불러오기
 */
const loadProdData = async () => {
    try {
        if (props.data.prdp_code != null && props.data.prdp_code !== '') {
            const response = await axios.get(`/api/wko/prodlist`, {
                params: {
                    prdp_code: props.data.prdp_code // 선택된 생산계획 코드로 필터링
                }
            });
            products.value = await response.data.data;
        }
        else {
            const response = await axios.get(`/api/wko/prodall`);
            products.value = await response.data.data;
        }
    }
    catch (err) {
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
    catch (err) {
        console.error(err);
    }
}

/**
 * 사원 목록 불러오기
 */
const loadEmpListData = async () => {
    try {
        const response = await axios.get(`/api/wko/emp-list`);
        empList.value = await response.data.data;
    }
    catch (err) {
        console.error(err);
    }
}

/**
 * 해당 제품이 선택 가능한 라인 목록 불러오기
 */
const loadLinesData = async () => {
    try {
        const response = await axios.get(`/api/wko/line-list`, {
            params: {
                prod_code: props.data.prod_code,
            }
        })
        lines.value = await response.data.data;
    }
    catch (err) {
        console.error(err);
    }
}

/**
 * 생산 계획 선택
 */
const prdpLoad = async (value) => {
    await emit('resetList');

    // 생산 계획 정보만 설정
    const updatedData = {
        ...props.data,
        wko_code: '', // 신규 등록 시 코드 비워두기
        wko_name: '', // 신규 등록 시 이름 비워두기
        prdp_code: value.prdp_code,
        reg_date: new Date().toISOString().split('T')[0], // 현재 날짜로 설정
        reg_name: '김영업',
        reg_code: 'EMP-10001',
        // 제품 정보는 별도 선택까지 대기
        prod_code: '',
        prod_name: '',
    };

    emit('update:data', updatedData);
}

/**
 * 제품 선택
 */
const prodLoad = async (value) => {
    if (value && value.prod_code) {
        const updatedData = {
            ...props.data,
            prod_code: value.prod_code,
            prod_name: value.prod_name,
            wko_qtt: value.planned_qtt === '-' ? 0 : value.planned_qtt, // 계획 수량 설정
            line_code: '', // 라인 코드 초기화
            line_name: '', // 라인 이름 초기화
        };

        console.log(`제품 선택: ${value.prod_code}, ${value.prod_name}`);

        emit('update:data', updatedData);

        // 생산계획과 제품이 모두 선택되면 공정 목록 로드 요청
        if (updatedData.prdp_code && updatedData.prod_code) {
            emit('prodPlanSelected', updatedData.prdp_code, updatedData.prod_code);
        }
    }
}

/**
 * 작업자 선택
 */
const empLoad = async (value) => {
    if (value && value.emp_code) {
        const updatedData = {
            ...props.data,
            emp_code: value.emp_code,
            emp_name: value.emp_name,
        };
        emit('update:data', updatedData);
    }
}

/**
 * 라인 선택
 */
const lineLoad = async (value) => {
    if (value && value.line_code) {
        const updatedData = {
            ...props.data,
            line_code: value.line_code,
            line_name: value.line_name,
        };
        emit('update:data', updatedData);
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
    await loadEmpListData();
    empPopupVisible.value = true;
}

const openProdPopup = async () => {
    await loadProdData();
    prodPopupVisible.value = true;
}

const saveWKO = async () => {
    if (!props.data.prod_code) {
        alert('제품을 선택하세요.');
        return;
    }
    if (!props.data.line_code) {
        alert('생산라인을 선택하세요.');
        return;
    }
    emit('saveData')
}

const openLinePopup = async () => {
    if (!props.data.prod_code) {
        alert('제품을 선택하세요.');
        return;
    }
    await loadLinesData();
    linePopupVisible.value = true;
}

const searchProd = async (value) => {
    try {
        if (props.data.prdp_code != null && props.data.prdp_code !== '') {
            const response = await axios.get(`/api/wko/prodSearchByPrdp`, {
                params: {
                    prdp_code: props.data.prdp_code,
                    prod_name: value,
                }
            });
            products.value = await response.data.data;
        }
        else {
            const response = await axios.get(`/api/wko/prodSearch`, {
                params: {
                    prod_name: value,
                }
            });
            products.value = await response.data.data;
        }
    }
    catch (err) {
        console.error(err);
    }
}

const searchEmp = async (value) => {
    try {
        const empName = value ?? '';
        const response = await axios.get(`/api/wko/emp-list`, {
            params: {
                emp_name: empName,
            }
        })
        empList.value = await response.data.data;
    }
    catch (err) {
        console.error(err);
    }
}

const searchLine = async (value) => {
    try {
        const lineName = value ?? '';
        const response = await axios.get(`/api/wko/line-list`, {
            params: {
                prod_code: props.data.prod_code,
                line_name: lineName,
            }
        })
        lines.value = await response.data.data;
    }
    catch (err) {
        console.error(err);
    }
}

const prodPopupVisible = ref(false);
const prdpPopupVisible = ref(false);
const wkoPopupVisible = ref(false);
const empPopupVisible = ref(false);
const linePopupVisible = ref(false);
const prodPlans = ref([]);
const empList = ref([]);
const products = ref([]);
const wkoList = ref([]);
const lines = ref([]);

// 작업 상태 옵션
const statOptions = ref([
    { label: '대기', value: 'v4' },
    { label: '진행중', value: 'v1' },
    { label: '완료', value: 'v2' },
    { label: '중단', value: 'v3' }
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
                    <!-- 수정: v-model 사용 또는 updateField 함수 사용 -->
                    <LabeledInput 
                        label="작업지시명" 
                        :model-value="data.wko_name" 
                        @update:model-value="updateField('wko_name', $event)"
                        class="flex-1" />
                </div>
                <div class="flex gap-2">
                    <LabeledInput label="생산계획코드" :model-value="data.prdp_code" :disabled="true" class="flex-1" />
                    <Button icon="pi pi-search" @click="openPrdpPopup" />
                </div>
            </div>

            <!-- 두 번째 행: 작업 정보 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div class="flex gap-2">
                    <LabeledInput label="제품" :model-value="data.prod_name" :disabled="true" class="flex-1" />
                    <Button icon="pi pi-search" @click="openProdPopup" />
                </div>
                <!-- 수정: v-model을 updateField로 변경 -->
                <LabeledInput 
                    label="생산수량" 
                    :model-value="data.wko_qtt" 
                    @update:model-value="updateField('wko_qtt', $event)"
                    type="number" />
                <div class="flex gap-2">
                    <LabeledInput label="생산라인" :model-value="data.line_code" :disabled="true" class="flex-1" />
                    <Button icon="pi pi-search" @click="openLinePopup" />
                </div>
            </div>

            <!-- 세 번째 행: 담당자, 비고 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <LabeledInput label="작성자" :model-value="data.reg_name" :disabled="true" />
                <LabeledInput label="작성일" :model-value="data.reg_date" :disabled="true" />
                <!-- 수정: v-model을 updateField로 변경 -->
                <LabeledTextarea 
                    label="비고" 
                    :model-value="data.note" 
                    @update:model-value="updateField('note', $event)"
                    placeholder="특이사항 입력" 
                    :rows="1" />
            </div>
        </div>
    </div>

    <!-- 작업지시서 검색 팝업 -->
    <WKOSearchPopup v-model:visible="wkoPopupVisible" @confirm="loadExistingWKO">
    </WKOSearchPopup>

    <!-- 생산계획 선택 팝업 -->
    <SinglePopup v-model:visible="prdpPopupVisible" :items="prodPlans" @confirm="prdpLoad" :mapper="prodPlanMapping"
        :dataKey="'prdp_code'" :placeholder="'생산계획 선택'">
    </SinglePopup>

    <!-- 제품 선택 팝업 -->
    <SinglePopup v-model:visible="prodPopupVisible" :items="products"
        :selectedHeader="['prod_code', 'prod_name', 'planned_qtt', 'note']"
        :mapper="{ 'prod_code': '제품코드', 'prod_name': '제품명', 'planned_qtt': '계획수량', 'note': '비고' }" @confirm="prodLoad"
        :dataKey="'prod_id'" @search="searchProd">
    </SinglePopup>

    <!-- 라인 선택 팝업 -->
    <SinglePopup v-model:visible="linePopupVisible" :items="lines"
        :selectedHeader="['line_code', 'line_name', 'note']"
        :mapper="{ 'line_code': '라인코드', 'line_name': '라인명', 'note': '비고' }" @confirm="lineLoad"
        :dataKey="'line_code'" @search="searchLine">
    </SinglePopup>
</template>