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
          <Button label="생산계획 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
            @click="dialogVisible = true" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="생산계획코드" v-model="prdp_code" placeholder="생산계획코드" :disabled="true" />
      <LabeledInput label="계획명" v-model="prdp_name" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="계획일자" v-model="prdp_date" :disabled="true" />
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
  <div class="space-y-4 mt-7">
    <div class="card flex flex-col gap-4">
      <div class="flex justify-between">
        <div class="font-semibold text-2xl">제품</div>
        <div class="flex justify-end gap-2">
          <Button label="선택 삭제" icon="pi pi-trash" severity="danger" @click="deleteSelected" />
          <Button label="행 추가" icon="pi pi-plus" @click="addRow" />
        </div>
      </div>
      <DataTable v-model:selection="selectedProducts" :value="productRows" scrollable scrollHeight="250px" showGridlines dataKey="id">
        <Column selectionMode="multiple" headerStyle="width: 3rem" />

        <Column field="prod_name" header="제품명">
          <template #body="slotProps">
            <div class="flex gap-2">
              <InputText v-model="slotProps.data.prod_name" readonly />
              <Button icon="pi pi-search" @click="() => openProductPopup(slotProps.data)" />
            </div>
          </template>
        </Column>

        <Column field="planned_qtt" header="수량">
          <template #body="slotProps">
            <InputNumber v-model="slotProps.data.planned_qtt" :min="0" showButtons />
          </template>
        </Column>

        <Column field="unit" header="단위">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.unit" />
          </template>
        </Column>

        <Column field="priority" header="우선순위">
          <template #body="slotProps">
            <InputNumber v-model="slotProps.data.priority" :min="0" showButtons />
          </template>
        </Column>

        <Column field="line_code" header="생산라인">
          <template #body="slotProps">
            <div class="flex gap-2">
              <InputText v-model="slotProps.data.line_code" readonly />
              <Button icon="pi pi-search" @click="() => openlinePopup(slotProps.data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <!-- 팝업 영역 -->
  <SinglePopup
    v-model:visible="dialogVisible"
    :items="products"
    :mapper="productionMapping"
    :dataKey="'prdp_code'"
    @confirm="handleConfirm"
  />
  <SinglePopup
    v-model:visible="productPopupVisible"
    :items="productList"
    @confirm="handleProductConfirm"
    :dataKey="'prod_code'"
    :mapper="productMapping"
    placeholder="제품코드 또는 제품명 또는 제품유형 검색"
  />
  <SinglePopup
    v-model:visible="linePopupVisible"
    :items="lineList"
    @confirm="handleLineConfirm"
    :dataKey="'line_code'"
    :mapper="lineMapping"
    placeholder="라인코드 또는 라인명 검색"
  />
</template>

<script setup>
import { ref } from 'vue'

import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledDatePicker from '@/components/registration-bar/LabeledDatePicker.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import productionMapping from '@/service/ProductionMapping';
import productMapping from '@/service/ProductMapping.js';
import lineMapping from '@/service/LineMapping.js';

// 기본값
const today = new Date().toISOString().slice(0, 10);
const prdp_code = ref('');
const prdp_name = ref('');
const prdp_date = ref(today);
const due_date = ref('');
const reg = ref('');
const note = ref('');
const start_date = ref('');
const end_date = ref('');

// 팝업 상태
const dialogVisible = ref(false);
const productPopupVisible = ref(false);
const linePopupVisible = ref(false);
const currentProductRow = ref(null);
const currentLineRow = ref(null);

// 리스트 데이터
const products = ref([
  { prdp_code: 'PLN0001', prdp_name: '2026-06 1차 계획',prdp_date :'2025.06.01',reg:'김길동',start_date:'2025.06.02',end_date:'2025.06.08', due_date: '2025-06-12',note:'' },
  { prdp_code: 'PLN0002', prdp_name: '2026-06 2차 계획',prdp_date :'2025.06.02',reg:'박길동',start_date:'2025.06.03',end_date:'2025.06.09', due_date: '2025-06-13',note:'' },
  { prdp_code: 'PLN0003', prdp_name: '2026-06 3차 계획',prdp_date :'2025.06.04',reg:'최길동',start_date:'2025.06.05',end_date:'2025.06.11', due_date: '2025-06-17',note:'' },
  { prdp_code: 'PLN0004', prdp_name: '2026-06 4차 계획',prdp_date :'2025.06.06',reg:'이길동',start_date:'2025.06.09',end_date:'2025.06.15', due_date: '2025-06-21',note:'' },
  { prdp_code: 'PLN0005', prdp_name: '2026-06 5차 계획',prdp_date :'2025.06.08',reg:'홍길동',start_date:'2025.06.10',end_date:'2025.06.16', due_date: '2025-06-22',note:'급함' },
  
]);

const productList = ref([
  { prod_code: 'EQ001',prod_name: '김치', prod_type: '식품', priority: 1 },
  { prod_code: 'EQ002',prod_name: '된장', prod_type: '식품', priority: 2 },
  { prod_code: 'EQ003',prod_name: '고추장', prod_type: '식품', priority: 3 }
]);

const lineList = ref([
  { line_code: 'LINE001', line_name: '라인A', is_used: '사용가능' },
  { line_code: 'LINE002', line_name: '라인B', is_used: '사용가능' },
  { line_code: 'LINE003', line_name: '라인C', is_used: '사용불가' },
  { line_code: 'LINE004', line_name: '라인D', is_used: '사용가능' },
]);

const productRows = ref([]);
const selectedProducts = ref([]);

// 핸들러
const handleConfirm = (selected) => {
  if (selected) {
    prdp_code.value = selected.prdp_code;
    prdp_name.value = selected.prdp_name;
    prdp_date.value = selected.prdp_date;
    due_date.value = selected.due_date;
    reg.value = selected.reg;
    start_date.value = selected.start_date;
    end_date.value = selected.end_date;
    note.value = selected.note;
  }
};

const handleProductConfirm = (selectedProduct) => {
  if (currentProductRow.value && selectedProduct) {
    currentProductRow.value.prod_name = selectedProduct.prod_name;
    currentProductRow.value.prod_type = selectedProduct.prod_type;
    currentProductRow.value.priority = selectedProduct.priority;
  }
  productPopupVisible.value = false;
};

const handleLineConfirm = (selectedLine) => {
  if (currentLineRow.value && selectedLine) {
    currentLineRow.value.line_code = selectedLine.line_code;
  }
  linePopupVisible.value = false;
};

// 버튼 기능
const addRow = () => {
  productRows.value.push({
    prod_name: '',
    planned_qtt: 0,
    unit: '',
    priority: 0,
    line_code: '',
  });
};

const deleteSelected = () => {
  productRows.value = productRows.value.filter(row => !selectedProducts.value.includes(row));
  selectedProducts.value = [];
};

// 팝업 열기 함수
const openProductPopup = (row) => {
  currentProductRow.value = row;
  productPopupVisible.value = true;
};

const openlinePopup = (row) => {
  currentLineRow.value = row;
  linePopupVisible.value = true;
};
</script>
