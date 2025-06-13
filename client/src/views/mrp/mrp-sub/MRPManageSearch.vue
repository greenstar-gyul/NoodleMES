<script setup>
import { onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import prodPlanMapping from '../../../service/ProductionPlanMapping';
import LabeledTextarea from '../../../components/registration-bar/LabeledTextarea.vue';
import LabeledInput from '../../../components/registration-bar/LabeledInput.vue';
import MRPService from '../../../service/MRPService';  // 백 서버 없이 테스트 용
import axios from 'axios';

const emit = defineEmits(['updateList', 'updatePrdp', 'resetList', 'saveData', 'update:data']);
const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    dataKey: {
        type: String,
        default: 'id'
    }
});

onMounted(() => {
    
})

/**
 * 생산 계획 불러오기 팝업 데이터 불러오기
 */
const loadPlansData = async () => {
    try {
        const response = await axios.get(`/api/mrp/plan-list`);
        response.result_code = "SUCCESS";
        response.message = "조회성공";
        // console.log(response);
        prodPlans.value = await response.data;
    }
    catch(err) {
        console.error(err);
    }
}

/**
 * 생산 계획 불러오기
 * @param value 선택한 생산 계획
 * 생산 계획 조회해서 기존 등록된 mrp가 있으면 mrp를 불러오고
 * 없다면 새로운 mrp 생성
 */
const prdpLoad = async (value) => {
    const prdpCode = value.prdp_code;

    const mrpCodeRes = await axios.get(`/api/mrp/mrpcode/${prdpCode}`);
    const mrpCodeData = await mrpCodeRes.data[0];
    let mrpCode = '';
    
    if (mrpCodeData) {
        mrpCode = mrpCodeData.mrp_code;
    }

    // MRP 폼 데이터
    const mrpData = {
        prdp_code: '',
        reg: '김영업',
        prdp_date: '',
        start_date: '',
        mrp_code: '',
        emp_code: 'EMP-10001',
        note: '',
    };

    // 선택된 값으로 채우기,, (생산 계획과 관련된 부분)
    mrpData.prdp_code = value.prdp_code;
    mrpData.prdp_date = value.prdp_date;
    mrpData.start_date = value.start_date;
    mrpData.reg = value.reg;
    mrpData.mrp_code = mrpCode;
    
    if (mrpCode != undefined && mrpCode != null && mrpCode != '') {
        
        // mrp 조회
        const mrpRes = await axios.get(`/api/mrp/${mrpCode}`);
        const findMRP = await mrpRes.data[0];
        
        mrpData.note = findMRP.mrp_note;
        mrpData.emp_code = findMRP.emp_code;
    }

    emit('update:data', mrpData);
}

const openPopup = async () => {
    await loadPlansData();
    mrpPopupVisible.value = true;
}

const saveMRP = async () => {
    if (props.data.prdp_code === '') {
        alert('생산 계획 먼저 선택해라ㅡㅡ');
        return;
    }
    emit('saveData')
}

const mrpPopupVisible = ref(false);
const prodPlans = ref([]);

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>

<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl"><b>MRP</b></div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="삭제" severity="danger" class="min-w-fit" />
                    <Button label="초기화" severity="contrast" class="min-w-fit" v-on:click="emit('resetList')" />
                    <Button label="저장" severity="info" class="min-w-fit" v-on:click="saveMRP"/>
                    <Button label="생산계획 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="MRP코드" :model-value="data.mrp_code" :disabled="true" placeholder="저장 시 자동으로 생성됩니다." />
            <LabeledInput label="생산계획코드" :model-value="data.prdp_code" :disabled="true" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="계획수립일" :model-value="data.prdp_date" :disabled="true" />
            <LabeledInput label="생산시작일" :model-value="data.start_date" :disabled="true" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="작성자" :model-value="data.reg" :disabled="true" />
            <LabeledTextarea label="비고" v-model="data.note" placeholder="특이사항 입력" :rows="1" />
        </div>
    </div>

    <!-- <p>{{ testList }}</p> -->

    <SinglePopup v-model:visible="mrpPopupVisible" :items="prodPlans" @confirm="prdpLoad" :mapper="prodPlanMapping"
        :dataKey="'prdp_code'" :placeholder="'생산계획 불러오기'"></SinglePopup>
</template>