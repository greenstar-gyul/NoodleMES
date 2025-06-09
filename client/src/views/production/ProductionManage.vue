<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 gap-4">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold text-2xl">생산계획</div>
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
      <LabeledInput label="생산계획코드" v-model="prdp_code" placeholder="생산계획코드" :disabled="true" />
      <LabeledInput label="계획명" v-model="prdp_name" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="계획일자" :value="prdp_date" />
      <LabeledInput label="작성자" v-model="reg" placeholder="작성자명" :disabled="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDatePicker label="계획시작일" v-model="start_date" />
      <LabeledDatePicker label="계획종료일" v-model="end_date" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDatePicker label="납기일자" v-model="due_date" />
      <LabeledTextarea label="비고" v-model="note" placeholder="특이사항 입력" />
    </div>
  </div>

  <!-- 생산계획상세 테이블 -->
  <div>
    <EditableTable
      :fields="['prod_code', 'prod_name', 'quantity', 'unit', 'priority_rank', 'line_code']"
      :mapper="{ prod_code: '제품코드', prod_name: '제품명', quantity: '수량', unit: '단위', priority_rank: '우선순위', line_code: '생산라인' }"
      dataKey="id"
      @update="handleUpdate"
      title="생산계획상세"
      scrollHeight="260px"
      class="mt-4"
    />
  </div>

  <!-- 팝업 -->
  <SinglePopup
    v-model:visible="dialogVisible"
    :items="products"
    :mapper="productionMapping"
    :dataKey="'prdp_code'"
    @confirm="handleConfirm"
  />
</template>

<script setup>
import { ref } from 'vue'

import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledDatePicker from '@/components/registration-bar/LabeledDatePicker.vue';
import LabeledReadonlyInput from '@/components/registration-bar/LabeledReadonlyInput.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import EditableTable from '@/components/form/EditableTable.vue';
import productionMapping from '@/service/ProductionMapping';

// 데이터 바인딩 변수들
const prdp_code = ref('');
const prdp_name = ref('');
const prdp_date = ref('');
const due_date = ref('');
const reg = ref('');
const note = ref('');
const start_date = ref('');
const end_date = ref('');

// 팝업 관련
const dialogVisible = ref(false);

const products = ref([
  { prdp_code: 'PLN0001', prdp_name: '2026-06 1차 계획', prdp_date: '2025-06-01', due_date: '2025-06-11' },
  { prdp_code: 'PLN0002', prdp_name: '2026-06 2차 계획', prdp_date: '2025-06-02', due_date: '2025-06-12' },
  { prdp_code: 'PLN0003', prdp_name: '2026-06 3차 계획', prdp_date: '2025-06-03', due_date: '2025-06-14' },
  { prdp_code: 'PLN0004', prdp_name: '2026-06 4차 계획', prdp_date: '2025-06-04', due_date: '2025-06-15' },
  { prdp_code: 'PLN0005', prdp_name: '2026-06 5차 계획', prdp_date: '2025-06-05', due_date: '2025-06-18' },
]);

const handleConfirm = (selected) => {
  if (selected) {
    prdp_code.value = selected.prdp_code;
    prdp_name.value = selected.prdp_name;
    prdp_date.value = selected.prdp_date;
    due_date.value = selected.due_date;
  }
};

const handleUpdate = (updatedData) => {
  console.log('업데이트된 테이블 데이터:', updatedData);
};
</script>
