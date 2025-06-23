<script setup>
import { ref, defineExpose, defineProps } from 'vue';
import axios from 'axios';
import TableWDE from '@/components/form/TableWithDelExcel.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import processMapping from '@/service/ProcessMapping.js';
import TableWithDelExcelFix from '@/components/form/TableWithDelExcelFix.vue';

const emit = defineEmits(['update:processRows','rowSelected' ,'rowSelecteds']);

const resetRows = () => {
  processRows.value = []
}

const selectedRow = ref(null);
const processRows = ref([]);
const selectedProducts = ref([]);
const processPopupVisible = ref(false);
const eqTypePopupVisible = ref(false);
const currentEditingRow = ref(null);

// ✔ 공정 목록 
const processList = ref([]);
// 설비 유형 목록
const eqTypeList = ref([]);


// ✔ 외부에서 form 데이터 넣기
const setFormData = (rows) => {
  processRows.value = rows.map(row => ({ ...row, id: row.id ?? Date.now() + Math.random() }));
};

// ✔ 외부에서 form 데이터 꺼내기
const getFormData = () => {
  return processRows.value;
};

// ✅ 외부에서 자재 목록 가져오기
const getDetailRows = () => {
  return processRows.value;
};

defineExpose({ setFormData, getFormData, getDetailRows, resetRows  });

// 행 추가
const addRow = () => {
   const nextNo = processRows.value.length + 1;
  processRows.value.push({
    no: nextNo,
    po_code: '',
    po_name: '',
    eq_type: '',
  });
};

// 선택 삭제
const deleteSelected = () => {
  processRows.value = processRows.value.filter(row => !selectedProducts.value.includes(row));
  selectedProducts.value = [];
  // ✅ 공정순서 다시 1부터 재정렬
  processRows.value.forEach((row, idx) => {
    row.no = idx + 1;
  });
};

// 제품공정흐름도 목록 테이블 클릭 시
const handleProcessRowClick  = (row) => {
  emit('rowSelected', row); // ✅ 반드시 rowSelected로 통일
  console.log('✅ row 클릭:', row)
};

// 흐름도 상세 테이블 선택 시
const onRowSelect  = (e) => {
emit('materialRowSelected', e.data);
};

// 공정 팝업 열기
const openProcessPopup = async (row) => {
  currentEditingRow.value = row;

  try {
    const res = await axios.get('/api/proc/process-popup');
    processList.value = res.data;
    processPopupVisible.value = true; // 성공적으로 불러오면 팝업 열기
  } catch (err) {
    console.error(' 프로세스 흐름 목록 불러오기 실패:', err);
    alert('프로세스 흐름 목록을 불러오지 못했습니다.');
  }
};

// 설비 유형 팝업 열기
const openEqTypePopup = async (row) => {
  currentEditingRow.value = row;

  try {
    const res = await axios.get('/api/proc/eqType-popup');
    eqTypeList.value = res.data;
    eqTypePopupVisible.value = true; // 성공적으로 불러오면 팝업 열기
  } catch (err) {
    console.error(' 설비 유형 불러오기 실패:', err);
    alert('설비 유형을 불러오지 못했습니다.');
  }
};

// 공정 팝업 확인 후 값 반영
const handleProcessConfirm = (selectedItem) => {
  if (!currentEditingRow.value || !selectedItem) return;

  currentEditingRow.value.po_code = selectedItem.po_code;
  currentEditingRow.value.po_name = selectedItem.po_name;
  currentEditingRow.value.pp_code = selectedItem.pp_code; // ✅ 추가

  processPopupVisible.value = false;
};

// 공정 팝업 확인 후 값 반영
const handleEqTypeConfirm = (selectedItem) => {
  if (!currentEditingRow.value || !selectedItem) return;

  currentEditingRow.value.eq_type = selectedItem.com_value;     
  currentEditingRow.value.eq_type_name = selectedItem.eq_type;    

  eqTypePopupVisible.value = false;
};


defineProps({
  data: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="space-y-4" style="width: 60%">
    <!-- 제품 검색 결과 (고정 영역) -->
  <TableWithDelExcelFix :data="data" :dataKey="'prod_proc_code'" :mapper="processMapping"
      :columns="['prod_proc_code', 'po_name', 'prod_code', 'prod_name', 'reg_date','note']" title="공정흐름도" scrollHeight="200px"
       @row-click="handleProcessRowClick" />

    <!-- 자재 입력 테이블 -->
    <div class="card flex flex-col gap-4">
      <div class="flex justify-between">
        <div class="font-semibold text-2xl">흐름도</div>
        <div class="flex justify-end gap-2">
          <Button label="선택 삭제" icon="pi pi-trash" severity="danger" @click="deleteSelected" />
          <Button label="행 추가" icon="pi pi-plus" @click="addRow" />
        </div>
      </div>

      <DataTable
        v-model:selection="selectedProducts"
        :value="processRows"
        @rowSelect="onRowSelect"
        scrollable
        scrollHeight="200px"
        showGridlines
        dataKey="no"
        class="w-full"
      >
        <Column selectionMode="multiple" headerStyle="width: 48px" />

        <Column field="no" header="공정순서" style="width: 100px">
          <template #body="slotProps">
            <span>{{ slotProps.data.no }}</span>
          </template>
        </Column>

        <Column field="po_code" header="공정코드" style="width: 150px">
          <template #body="slotProps">
            <div class="flex gap-2">
              <InputText v-model="slotProps.data.po_code" readonly style="width: 100%" />
              <Button icon="pi pi-search" @click="() => openProcessPopup(slotProps.data)"
                style="width: 32px; min-width: 32px;" />
            </div>
          </template>
        </Column>

        <Column field="po_name" header="공정명" style="width: 160px">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.po_name" style="width: 100%" :disabled="true" />
          </template>
        </Column>

        <Column field="eq_type" header="설비유형" style="width: 150px">
          <template #body="slotProps">
            <div class="flex gap-2">
              <InputText v-model="slotProps.data.eq_type_name" readonly style="width: 100%" />
              <Button icon="pi pi-search" @click="() => openEqTypePopup(slotProps.data)"
                style="width: 32px; min-width: 32px;" />
            </div>
          </template>
        </Column>

      </DataTable>
    </div>
  </div>

  <!-- 자재 선택 팝업 -->
  <SinglePopup
    v-model:visible="processPopupVisible"
    :items="processList"
    :dataKey="'po_code'"
    :mapper="processMapping"
    @confirm="handleProcessConfirm"
    placeholder="자재코드 또는 자재명 또는 자재유형 검색"
  />
  <SinglePopup
    v-model:visible="eqTypePopupVisible"
    :items="eqTypeList"
    :dataKey="'eq_type'"
    :mapper="processMapping"
    @confirm="handleEqTypeConfirm"
    placeholder="자재코드 또는 자재명 또는 자재유형 검색"
  />
</template>
