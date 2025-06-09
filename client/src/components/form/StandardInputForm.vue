<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import LabeledInput from '@/components/common/LabeledInput.vue';
import LabeledDropdown from '@/components/common/LabeledDropdown.vue';
import LabeledDatePicker from '@/components/common/LabeledDatePicker.vue';
import LabeledTextarea from '@/components/common/LabeledTextarea.vue';

// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    prod_code: '',
    prod_name: '',
    regdate_from: null,
    regdate_to: null,
    is_used: ''
});

// 주문상태 옵션 (예시 데이터)
const orderStatusOptions = [
    { label: '활성', value: 'a1' },
    { label: '비활성', value: 'a2' }
];

</script>
<template>
    <!-- 우측: 제품 등록 영역 (40%) -->
    <div class="card space-y-4 p-6" style="width: 40%; height: 530px">
        <!-- 버튼 영역역 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">기준정보</div>
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
        <!-- 규격 / 사용여부 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabeledInput v-model="spec" label="규격" />
            <LabeledDropdown v-model="search.is_used" label="사용여부" :options="orderStatusOptions" />
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

<style scoped>

</style>
