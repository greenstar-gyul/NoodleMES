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
                    <Button label="초기화" severity="contrast" class="min-w-fit" />
                    <Button label="저장" severity="info" class="min-w-fit" />
                    <Button label="생산계획 불러오기" severity="success" class="min-w-fit whitespace-nowrap" @click="dialogVisible = true" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- <LabeledInput label="생산계획코드" :value="prdp_code" placeholder="생산계획코드" :disabled="true" /> -->
            <LabeledInput label="MRP코드" :model-value="mrp_code" :disabled="true" />
            <LabeledInput label="생산계획코드" :model-value="prdp_code" :disabled="true" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="계획수립일" :model-value="plan_date" :disabled="true" />
            <LabeledInput label="생산시작일" :model-value="start_date" :disabled="true" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="작성자" :model-value="writer" :disabled="true" />
            <LabeledTextarea label="비고" v-model="note" placeholder="특이사항 입력" :rows="1" />
        </div>
    </div>
    <SinglePopup v-model:visible="dialogVisible" :items="prodPlans" @confirm="prdpLoad" :mapper="prodPlanMapping" :dataKey="'prdp_code'" :placeholder="'테스트'"></SinglePopup>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import prodPlanMapping from '../../../service/ProductionPlanMapping';
import LabeledTextarea from '../../../components/registration-bar/LabeledTextarea.vue';
import LabeledInput from '../../../components/registration-bar/LabeledInput.vue';

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

// 조회 폼 데이터
const prdp_code = ref('PRDP-202506-123'); // 생산계획코드
const writer = ref('Elia Arcia'); // 작성자
const plan_date = ref('2025-05-27'); // 계획수립일
const start_date = ref('2025-06-05'); // 생산시작일
const mrp_code = ref('MRP-20250603-001'); // MRP 코드

const dialogVisible = ref(false);

const prodPlans = ref([
    {
        prdp_code: "PRDP-202505-123",
        prdp_name: "생산계획1",
        plan_date: "2025-05-27",
        start_date: "2025-06-05",
        end_date: "2025-06-06",
        note: "생산 빨리 해주세요",
    },
    {
        prdp_code: "PRDP-202506-001",
        prdp_name: "생산계획2",
        plan_date: "2025-05-28",
        start_date: "2025-06-15",
        end_date: "2025-06-30",
        note: "생산 빨리 해주세요@@@@",
    },
    {
        prdp_code: "PRDP-202506-002",
        prdp_name: "생산계획3",
        plan_date: "2025-05-29",
        start_date: "2025-06-05",
        end_date: "2025-06-06",
        note: "생산 빨리 해주세요@@",
    },
    {
        prdp_code: "PRDP-202506-003",
        prdp_name: "생산계획4",
        plan_date: "2025-06-01",
        start_date: "2025-06-13",
        end_date: "2025-06-26",
        note: "생산 빨리 해주세요@@@@",
    },
    {
        prdp_code: "PRDP-202506-004",
        prdp_name: "생산계획5",
        plan_date: "2025-06-04",
        start_date: "2025-06-07",
        end_date: "2025-06-11",
        note: "생산 빨리 해주세요@@@@@@@",
    },
])

const prdpLoad = function(value) {
    console.log(value);
    prdp_code.value = value.prdp_code;
    plan_date.value = value.plan_date; 
    start_date.value = value.start_date;
}

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
