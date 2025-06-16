<script setup>
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';

// Props
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  mapper: {
    type: Object,
    default: () => ({})
  },
  dataKey: {
    type: String,
    default: 'id'
  },
  title: {
    type: String,
    default: ''
  },
  scrollHeight: {
    type: String,
    default: '400px' // 기본값 지정
  },
  columns: {
    type: Array,
    default: () => []
  },

  initialData: {  // 🎯 초기 데이터 받기
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update', 'loadEquipment'])
const selectedE = ref([]);
const dynamicColumns = ref([]);
// 상태 관리
const rows = ref([]) // 전체 데이터
const selectedRows = ref([]) // 선택된 행

// 초기 데이터 로딩 및 변경사항 감지
watch(
  () => props.initialData,
  (newData) => {
    rows.value = [...newData];
  },
  { immediate: true, deep: true }
);

// 새 행 추가
const addRow = () => {
  const newRow = Object.fromEntries(props.data.map(f => [f, '']))
  newRow[props.dataKey] = 'NEW_' + Date.now() // 임시 ID
  rows.value.push(newRow)
  emit('update', rows.value);
  console.log('➕ 새 행 추가됨!');
}

// 선택된 행 삭제
const deleteSelected = () => {
  if (selectedRows.value.length === 0) {
    console.log('⚠️ 삭제할 행을 선택해주세요!');
    return;
  }

  rows.value = rows.value.filter(row => !selectedRows.value.includes(row))
  selectedRows.value = []
  emit('update', rows.value);
  console.log('🗑️ 선택된 행이 삭제되었습니다!');
}

const loadEquipment = () => {
  emit('loadEquipment')
}

const handleInputChange = () => {
  emit('update', rows.value);
  console.log('입력 변경됨!');
}
</script>

<template>
  <div class="card">
    <div class="flex flex-col gap-4">
      <!-- 🎯 타이틀 및 버튼 영역 -->
      <div class="grid grid-cols-1 gap-4">
        <div class="flex justify-between">
          <div>
            <div class="font-semibold text-2xl">{{ title }}</div>
          </div>
          <div class="flex justify-end gap-2">
            <Button label="선택 삭제" icon="pi pi-trash" severity="danger" @click="deleteSelected"
              :disabled="selectedRows.length === 0" />
            <Button label="행 추가" icon="pi pi-plus" @click="addRow" />
            <Button label="지시정보 불러오기" severity="success" class="min-w-fit whitespace-nowrap" @click="loadEquipment" />
          </div>
        </div>
      </div>

      <!-- 📋 데이터 테이블 -->
      <DataTable v-model:selection="selectedRows" :value="rows" :dataKey="dataKey" selectionMode="multiple"
        showGridlines scrollable :scrollHeight="scrollHeight" tableStyle="min-width: 50rem">
        <Column selectionMode="multiple" headerStyle="width: 3rem" />

        <Column v-for="col in data" :key="dataKey" :field="col" :header="mapper[col] ?? col">
          <template #body="slotProps">
            <InputText v-model="slotProps.data[col]" class="w-full" placeholder="입력해주세요" @input="handleInputChange" />
          </template>
        </Column>
      </DataTable>

      <!-- 📊 현재 데이터 개수 표시 -->
      <div class="text-sm text-gray-600">
        총 {{ rows.length }}건의 데이터
      </div>
    </div>
  </div>
</template>
