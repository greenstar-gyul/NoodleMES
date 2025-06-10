<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import LabeledInput from '@/components/common/LabeledInput.vue';
import LabeledDropdown from '@/components/common/LabeledDropdown.vue';
import LabeledDatePicker from '@/components/common/LabeledDatePicker.vue';
import LabeledTextarea from '@/components/common/LabeledTextarea.vue';

const productTypeOptions = [
    { label: '봉지라면', value: 'a1' },
    { label: '컵라면(대)', value: 'a2' },
    { label: '컵라면(소)', value: 'a3' }
];

const unitOptions = [
    { label: '개', value: 'a1' },
    { label: '박스', value: 'a2' },
];

const specOptions = [
    { label: '-', value: 'a1' },
    { label: '20', value: 'a2' },
    { label: '40', value: 'a3' },
    { label: '16', value: 'a4' },
    { label: '8', value: 'a5' },
    { label: '12', value: 'a6' },
    { label: '6', value: 'a7' },
];

const orderStatusOptions = [
    { label: '활성', value: 'a1' },
    { label: '비활성', value: 'a2' }
];

// v-model 대상 변수들
const prod_code = ref('');
const prod_name = ref('');
const prod_type = ref('');
const unit = ref('');
const spec = ref('');
const is_used = ref('');
const edate = ref('');
const regdate = ref('');
const note = ref('');
</script>

<template>
    <div class="card space-y-4 p-6" style="width: 40%; height: 63vh">
        <!-- 버튼 영역역 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">기준 정보</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="수정" severity="info" class="min-w-fit whitespace-nowrap" outlined />
                    <Button label="등록" severity="success" class="min-w-fit whitespace-nowrap" outlined />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabeledInput v-model="prod_code" label="제품코드" placeholder="제품코드" :disabled="true" />
            <LabeledInput v-model="prod_name" label="제품명" placeholder="제품명" />
        </div>
        <!-- 제품유형 / 사용여부 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabeledDropdown v-model="prod_type" label="제품유형" :options="productTypeOptions" />
            <LabeledDropdown v-model="unit" label="단위" :options="unitOptions" />
        </div>
        <!-- 규격 / 사용여부 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabeledDropdown v-model="spec" label="규격" :options="specOptions" />
            <LabeledDropdown v-model="is_used" label="사용여부" :options="orderStatusOptions" />
        </div>

        <!-- 유통기한 / 등록일자 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabeledInput v-model="edate" label="유통기한" />
            <LabeledDatePicker v-model="regdate" label="등록일자" placeholder="자동으로 입력" :disabled="true" />
        </div>

        <!-- 비고 -->
        <LabeledTextarea v-model="note" label="비고" placeholder="특이사항 입력" :rows="7" :autoResize="true" />
    </div>
</template>