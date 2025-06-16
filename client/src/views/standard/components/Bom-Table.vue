<script setup>
import { ref, defineExpose, defineProps } from 'vue';
import axios from 'axios';
import TableWDE from '@/components/form/TableWithDelExcel.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import bomMapper from '@/service/BOMMapping.js';
import matMapping from '@/service/MatMapping.js';
import TableWithDelExcelFix from '../../../components/form/TableWithDelExcelFix.vue';

const emit = defineEmits(['update:productRows','rowSelected' ,'rowSelecteds']);

const resetRows = () => {
  productRows.value = []
}

const selectedRow = ref(null);

const onRowSelect  = (e) => {
  // 자재 테이블 선택 시
emit('materialRowSelected', e.data);
};

const handleProductRowClick  = (row) => {
  // 제품 목록 테이블 클릭 시
  emit('rowSelected', row); // ✅ 반드시 rowSelected로 통일
  console.log('✅ row 클릭:', row)
};

// ✔ BOM 테이블 데이터
const productRows = ref([]);
const selectedProducts = ref([]);
const matPopupVisible = ref(false);
const currentEditingRow = ref(null);

// ✔ 자재 목록 및 옵션
const matList = ref([]);



// ✔ 외부에서 form 데이터 넣기
const setFormData = (rows) => {
  productRows.value = rows.map(row => ({ ...row, id: row.id ?? Date.now() + Math.random() }));
};

// ✔ 외부에서 form 데이터 꺼내기
const getFormData = () => {
  return productRows.value;
};

// ✅ 외부에서 자재 목록 가져오기
const getDetailRows = () => {
  return productRows.value;
};

defineExpose({ setFormData, getFormData, getDetailRows, resetRows  });

// 행 추가
const addRow = () => {
  productRows.value.push({
    id: Date.now(),
    mat_code: '',
    mat_name: '',
    mat_type: '',
    req_qtt: 0,
    unit: '',
    loss_rate: 0
  });
};

// 선택 삭제
const deleteSelected = () => {
  productRows.value = productRows.value.filter(row => !selectedProducts.value.includes(row));
  selectedProducts.value = [];
};

// 팝업 열기
const openMatPopup = async (row) => {
  currentEditingRow.value = row;

  try {
    const res = await axios.get('/api/bom/materials-popup');
    matList.value = res.data;
    console.log('자재 목록 불러옴:', matList.value);
    matPopupVisible.value = true; // 성공적으로 불러오면 팝업 열기
  } catch (err) {
    console.error(' 자재 목록 불러오기 실패:', err);
    alert('자재 목록을 불러오지 못했습니다.');
  }
};

// 팝업 확인 후 값 반영
const handleProductConfirm = (selectedItem) => {
  if (!currentEditingRow.value || !selectedItem) return;

  currentEditingRow.value.mat_code = selectedItem.code;
  currentEditingRow.value.mat_name = selectedItem.name;
  currentEditingRow.value.mat_type = selectedItem.type;

  matPopupVisible.value = false;
};

defineProps({
  data: {
    type: Array,
    required: true
  }
});

const unitOptions = [
  { label: 'KG', value: 'h1' },
  { label: 'T', value: 'h2' },
  { label: 'L', value: 'h3' },
  { label: 'EA', value: 'h4' },
  { label: 'BOX', value: 'h5' },
  { label: 'G', value: 'h6' },
  { label: 'MM', value: 'h7' },
  { label: '%', value: 'h8' },
  { label: 'CM', value: 'h9' }
];


</script>

<template>
  <div class="space-y-4" style="width: 60%">
    <!-- 제품 검색 결과 (고정 영역) -->
  <TableWithDelExcelFix :data="data" :dataKey="'bom_code'" :mapper="bomMapper"
      :columns="['bom_code', 'prod_code', 'prod_name', 'regdate']" title="검색결과" scrollHeight="200px"
       @row-click="handleProductRowClick" />

    <!-- 자재 입력 테이블 -->
    <div class="card flex flex-col gap-4">
      <div class="flex justify-between">
        <div class="font-semibold text-2xl">하위 자재 </div>
        <div class="flex justify-end gap-2">
          <Button label="선택 삭제" icon="pi pi-trash" severity="danger" @click="deleteSelected" />
          <Button label="행 추가" icon="pi pi-plus" @click="addRow" />
        </div>
      </div>

      <DataTable
        v-model:selection="selectedProducts"
        :value="productRows"
        @rowSelect="onRowSelect"
        scrollable
        scrollHeight="200px"
        showGridlines
        dataKey="id"
        class="w-full"
      >
        <Column selectionMode="multiple" headerStyle="width: 48px" />

        <Column field="mat_code" header="자재코드" style="width: 150px">
          <template #body="slotProps">
            <div class="flex gap-2">
              <InputText v-model="slotProps.data.mat_code" readonly style="width: 100%" />
              <Button icon="pi pi-search" @click="() => openMatPopup(slotProps.data)"
                style="width: 32px; min-width: 32px;" />
            </div>
          </template>
        </Column>

        <Column field="mat_name" header="자재명" style="width: 160px">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.mat_name" style="width: 100%" :disabled="true" />
          </template>
        </Column>

        <Column field="mat_type" header="자재유형" style="width: 130px">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.mat_type" style="width: 100%" :disabled="true" />
          </template>
        </Column>

        <Column field="req_qtt" header="소요수량" style="width: 100px">
          <template #body="slotProps">
            <InputNumber v-model="slotProps.data.req_qtt" :min="0" :step="1" :mode="'decimal'" inputStyle="width: 100%" showButtons />
          </template>
        </Column>

        <Column field="unit" header="단위" style="width: 100px">
            <template #body="slotProps">
                <Dropdown v-model="slotProps.data.unit" :options="unitOptions" optionLabel="label" optionValue="value"
                    placeholder="단위 선택" class="w-full" />
            </template>
        </Column>

        <Column field="loss_rate" header="손실율(%)" style="width: 120px">
          <template #body="slotProps">
            <InputNumber v-model="slotProps.data.loss_rate" :min="0" :step="0.1" :mode="'decimal'" inputStyle="width: 100%"  showButtons/>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <!-- 자재 선택 팝업 -->
  <SinglePopup
    v-model:visible="matPopupVisible"
    :items="matList"
    :dataKey="'code'"
    :mapper="matMapping"
    @confirm="handleProductConfirm"
    placeholder="자재코드 또는 자재명 또는 자재유형 검색"
  />
</template>
