<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">기본정보</div>
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
            <LabeledReadonlyInput label="작업지시서번호" :value="prdp_code" />
            <LabeledReadonlyInput label="생산계획번호" :value="writer" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledReadonlyInput label="계획수립일" :value="plan_date" />
        </div>
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">작업지시사항</div>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledReadonlyInput label="제품명" :value="prdp_code" />
            <LabeledTextarea label="지시수량" v-model="note" placeholder="지시수량" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledReadonlyInput label="작업지시일" :value="plan_date" />
            <LabeledReadonlyInput label="지시상태" :value="start_date" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledTextarea label="비고" v-model="note" placeholder="특이사항 입력" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';

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

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
