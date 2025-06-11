<script setup>
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import prodPlanMapping from '../../../service/ProductionPlanMapping';
import LabeledTextarea from '../../../components/registration-bar/LabeledTextarea.vue';
import LabeledInput from '../../../components/registration-bar/LabeledInput.vue';
import MRPService from '../../../service/MRPService';  // 백 서버 없이 테스트 용
import axios from 'axios';


onMounted(async () => {
    loadPlansData();
    loadDatas();
    resetData(); // 조회 폼 초기화
})

// 데이터 불러오기
const loadDatas = async () => {
    // prodPlans.value = MRPService.prodPlans; // 백 서버 없이 테스트 용
    mrpList.value = MRPService.mrpList; // 백 서버 없이 테스트 용

    const response = await axios.get(`/api/mrp/all`);
    testList.value = await response.data;

    
}

/**
 * 생산 계획 불러오기 팝업 데이터 불러오기
 */
const loadPlansData = async () => {
    try {
        const response = await axios.get(`/api/mrp/plan-list`);
        prodPlans.value = await response.data;
    }
    catch(err) {
        console.error(err);
    }
}

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    dataKey: {
        type: String,
        default: 'id'
    }
});

// 조회 폼 초기화
const resetData = () => {
    mrpData.value = {
        prdp_code: '',
        reg: '동',
        prdp_date: '',
        start_date: '',
        mrp_code: `MRP-${fulldate}-001`,
    };
}

/**
 * 생산 계획 불러오기
 * @param value 선택한 생산 계획
 * 생산 계획 조회해서 기존 등록된 mrp가 있으면 mrp를 불러오고
 * 없다면 새로운 mrp 생성
 */
const prdpLoad = async (value) => {
    console.log(value);
    const prdpCode = value.prdp_code;
    //  const isFind = mrpList.value.findIndex((mrp) => mrp.prdp_code === prdpCode);

    const mrpCodeRes = axios.get(`/api/mrp/mrpcode/${prdpCode}`);
    const mrpCode = mrpCodeRes.data;

    if (mrpCode != null || mrpCode != '') {
        const mrpRes = axios.get(`/api/mrp/${mrpCode}`);
        const findMRP = mrpRes.data;

        mrpData.value.mrp_code = findMRP.mrp_code;
        mrpData.value.prdp_code = findMRP.prdp_code;
        mrpData.value.prdp_date = findMRP.prdp_date;
        mrpData.value.start_date = findMRP.start_date;
        mrpData.value.reg = findMRP.reg;
        mrpData.value.note = findMRP.note;
    }
    else {
        resetData();
        mrpData.value.prdp_code = value.prdp_code;
        mrpData.value.prdp_date = value.prdp_date;
        mrpData.value.start_date = value.start_date;
        mrpData.value.reg = value.reg;
    }
}

const openPopup = async () => {
    await loadPlansData();
    mrpPopupVisible.value = true;
}

// 조회 폼 데이터
const mrpData = ref({
    prdp_code: '',
    reg: '',
    prdp_date: '',
    start_date: '',
    mrp_code: '',
});

const mrpPopupVisible = ref(false);
const prodPlans = ref([]);
const mrpList = ref([]);
const testList = ref([]);

const currentDate = new Date();
const tMonth = currentDate.getMonth() + 1;
const month = tMonth < 10 ? `0${tMonth}` : tMonth;

const tDate = currentDate.getDate();
const date = tDate < 10 ? `0${tDate}` : tDate;

const fulldate = `${currentDate.getFullYear()}${month}${date}`;

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
                    <Button label="초기화" severity="contrast" class="min-w-fit" v-on:click="resetData" />
                    <Button label="저장" severity="info" class="min-w-fit" />
                    <Button label="생산계획 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="MRP코드" :model-value="mrpData.mrp_code" :disabled="true" />
            <LabeledInput label="생산계획코드" :model-value="mrpData.prdp_code" :disabled="true" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="계획수립일" :model-value="mrpData.prdp_date" :disabled="true" />
            <LabeledInput label="생산시작일" :model-value="mrpData.start_date" :disabled="true" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="작성자" :model-value="mrpData.reg" :disabled="true" />
            <LabeledTextarea label="비고" v-model="mrpData.note" placeholder="특이사항 입력" :rows="1" />
        </div>
    </div>

    <!-- <p>{{ testList }}</p> -->

    <SinglePopup v-model:visible="mrpPopupVisible" :items="prodPlans" @confirm="prdpLoad" :mapper="prodPlanMapping"
        :dataKey="'prdp_code'" :placeholder="'생산계획 불러오기'"></SinglePopup>
</template>