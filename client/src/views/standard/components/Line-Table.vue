<script setup>
import { ref, defineExpose, defineProps, watch } from 'vue';
import axios from 'axios';
import TableWDE from '@/components/form/TableWithDelExcel.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import facilitieMapping from '@/service/FacilitieMapping.js';
import processPMapping from '@/service/ProcessPMapping.js';
import processMapping from '@/service/ProcessMapping.js';
import lineMapping from '@/service/LineMapping.js';

const emit = defineEmits(['update:lineRows','rowSelected' ,'rowSelecteds']);

const resetRows = () => {
  lineRows.value = []
}

const selectedRow = ref(null);

const onRowSelect  = (e) => {
  // 자재 테이블 선택 시
emit('materialRowSelected', e.data);
};


const handleLineRowClick  = (row) => {
  // 라인 목록 테이블 클릭 시
  emit('rowSelected', row); // ✅ 반드시 rowSelected로 통일
};

// ✔ 라인 테이블 데이터
const lineRows = ref([]);
const selectedLines = ref([]);

const currentEditingRow = ref(null); 

//  공정 팝업 세팅
const processPopupVisible = ref(false);
// 설비 팝업 세팅
const facilitiePopupVisible = ref(false);

// ✔ 공정 목록 
const processList = ref([]);

// ✔ 설비 목록 
const facilitieList = ref([]);



// ✔ 외부에서 form 데이터 넣기
const setFormData = (rows) => {
  lineRows.value = rows.map(row => ({ ...row, id: row.id ?? Date.now() + Math.random() }));
};

// ✔ 외부에서 form 데이터 꺼내기
const getFormData = () => {
  return lineRows.value;
};

// 외부에서 라인 목록 가져오기
const getDetailRows = () => {
  return lineRows.value;
};

defineExpose({ setFormData, getFormData, getDetailRows, resetRows  });

// 행 추가
const addRow = () => {
  lineRows.value.push({
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
  lineRows.value = lineRows.value.filter(row => !selectedLines.value.includes(row));
  selectedLines.value = [];
};

// 공정 팝업 열기
const openProcessPopup = async (row) => {
  currentEditingRow.value = row;

  try {
    const res = await axios.get('/api/line/process-popup');
    processList.value = res.data;
    processPopupVisible.value = true; // 성공적으로 불러오면 팝업 열기
  } catch (err) {
    console.error(' 프로세스 흐름 목록 불러오기 실패:', err);
    alert('프로세스 흐름 목록을 불러오지 못했습니다.');
  }
};


// 설비 팝업 열기 
const openFacilitiePopup = async (row) => {
  currentEditingRow.value = row;

  try {
    const res = await axios.get('/api/line/facilitie-popup');
    facilitieList.value = res.data;

    facilitiePopupVisible.value = true; // 성공적으로 불러오면 팝업 열기
  } catch (err) {
    console.error(' 프로세스 흐름 목록 불러오기 실패:', err);
    alert('프로세스 흐름 목록을 불러오지 못했습니다.');
  }
};

// 공정 팝업 확인 후 값 반영
const handleProcessConfirm = (selectedItem) => {
  if (!currentEditingRow.value || !selectedItem) return;


  currentEditingRow.value.no = selectedItem.no;
  currentEditingRow.value.po_code = selectedItem.po_code;
  currentEditingRow.value.po_name = selectedItem.po_name;
  currentEditingRow.value.eq_type = selectedItem.eq_type;

  currentEditingRow.value.pp_code = selectedItem.pp_code ?? ''; 

  processPopupVisible.value = false;
};

// 설비 팝업 확인 후 값 반영
const handleFacilitieConfirm = (selectedItem) => {

  if (!currentEditingRow.value || !selectedItem) return;

  currentEditingRow.value.eq_code = selectedItem.eq_code;

  facilitiePopupVisible.value = false;
};

// props 정의
const props = defineProps({
  data: { type: Array, required: true },          // 검색 결과
  tableData: { type: Array, default: () => [] },  // 제품 선택 시 설비 구성 리스트
});

// tableData 감지
watch(() => props.tableData, (newData) => {
  console.log('✅ 설비 구성 데이터 감지됨:', newData);
  if (newData && Array.isArray(newData)) {
    lineRows.value = newData.map(item => ({
      id: Date.now() + Math.random(),
      no: item.no,
      po_code: item.po_code,
      po_name: item.po_name,
      eq_type: item.eq_type,
      eq_type_name: item.eq_type_name,
      eq_code: '',
      eq_name: '',
      pp_code: item.pp_code
    }));
  }
});


</script>

<template>
  <div class="space-y-4" style="width: 60%">
    <!-- 제품 검색 결과 (고정 영역) -->
    <TableWDE
      :data="data"
      :dataKey="'line_code'"
      :mapper="lineMapping"
      :columns="['line_code', 'line_name', 'line_type','regdate_t', 'note', 'is_used']"
      title="검색결과"
      :scrollHeight="'200px'"
      @row-click="handleLineRowClick"
    />

    <!-- 라인 설비 구성영역 입력 테이블 -->
    <div class="card flex flex-col gap-4">
      <div class="flex justify-between">
        <div class="font-semibold text-2xl">라인 설비 구성영역 </div>
        <div class="flex justify-end gap-2">
          <Button label="선택 삭제" icon="pi pi-trash" severity="danger" @click="deleteSelected" />
          <Button label="행 추가" icon="pi pi-plus" @click="addRow" />
        </div>
      </div>

      <DataTable
        v-model:selection="selectedLines"
        :value="lineRows"
        @rowSelect="onRowSelect"
        scrollable
        scrollHeight="250px"
        showGridlines
        dataKey="id"
        class="w-full"
      >
        <Column selectionMode="multiple" headerStyle="width: 48px" />

        <Column field="no" header="공정순서" style="width: 160px">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.no" style="width: 100%" :disabled="true" />
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

        <Column field="eq_type" header="설비유형" style="width: 160px">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.eq_type" style="width: 100%" :disabled="true" />
          </template>
        </Column>

        <Column field="eq_code" header="설비코드" style="width: 150px">
          <template #body="slotProps">
            <div class="flex gap-2">
              <InputText v-model="slotProps.data.eq_code" readonly style="width: 100%" />
              <Button icon="pi pi-search" @click="() => openFacilitiePopup(slotProps.data)"
                style="width: 32px; min-width: 32px;" />
            </div>
          </template>
        </Column>

        <Column field="pp_code" style="display: none" />

      </DataTable>
      
    </div>
  </div>
  <!-- 공정 선택 팝업 -->
  <SinglePopup
    v-model:visible="processPopupVisible"
    :items="processList"
    :dataKey="'no'"
    :mapper="processPMapping"
    @confirm="handleProcessConfirm"
    placeholder="공정코드 또는 공정명 검색"
  />
  <!-- 설비 선택 팝업 -->
  <SinglePopup
    v-model:visible="facilitiePopupVisible"
    :items="facilitieList"
    :dataKey="'eq_code'"
    :mapper="facilitieMapping"
    @confirm="handleFacilitieConfirm"
    placeholder="설비코드 또는 설비명  검색"
  />
</template>
