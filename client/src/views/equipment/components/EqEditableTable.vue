<script setup>
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';

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
    default: '400px'
  },
  columns: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update', 'loadEquipment'])
const selectedE = ref([]);
const dynamicColumns = ref([]);

const rows = ref([])
const selectedRows = ref([])

const isDateColumn = (fieldName) => {
  return fieldName && fieldName.toLowerCase().includes('date');
};

const formatDateForDB = (date) => {
  if (!date) return null;
  
  try {
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    if (typeof date === 'string') {
      return date;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

const parseDateFromDB = (dateString) => {
  if (!dateString) return null;
  
  try {
    if (dateString instanceof Date) {
      return isNaN(dateString.getTime()) ? null : dateString;
    }
    
    if (typeof dateString === 'string') {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

watch(
  () => props.data,
  (newData) => {
    if (!Array.isArray(newData)) {
      rows.value = [];
      return;
    }
    
    rows.value = newData.map(row => {
      const processedRow = { ...row };
      
      Object.keys(processedRow).forEach(fieldName => {
        if (isDateColumn(fieldName) && processedRow[fieldName]) {
          const dateValue = parseDateFromDB(processedRow[fieldName]);
          if (dateValue) {
            processedRow[fieldName] = dateValue;
          }
        }
      });
      
      return processedRow;
    });
  },
  { immediate: true, deep: true }
);

// 새 행 추가
const addRow = () => {
  const newRow = {};
  Object.keys(props.mapper).forEach(key => {
    newRow[key] = '';
  });
  newRow[props.dataKey] = 'NEW_' + Date.now();
  rows.value.push(newRow);
}

const deleteSelected = () => {
  if (selectedRows.value.length === 0) {
    return;
  }

  rows.value = rows.value.filter(row => !selectedRows.value.includes(row));
  selectedRows.value = [];
}

const loadEquipment = () => {
  emit('loadEquipment');
}

const update = () => {
  emit('update');
}

const handleInputChange = () => {
  // console.log('텍스트 입력 변경 - 로컬에서만 저장');
}

const handleDateChange = () => {
  // console.log('날짜 변경 - 로컬에서만 저장');
}
</script>

<template>
  <div class="card">
    <div class="flex flex-col gap-4">
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

      <DataTable v-model:selection="selectedRows" :value="rows" :dataKey="dataKey" selectionMode="multiple"
        showGridlines scrollable :scrollHeight="scrollHeight" tableStyle="min-width: 50rem">
        <Column selectionMode="multiple" headerStyle="width: 3rem" />

        <Column v-for="fieldName in Object.keys(mapper)" :key="fieldName" :field="fieldName"
          :header="mapper[fieldName]">
          <template #body="slotProps">
            <Calendar 
              v-if="isDateColumn(fieldName)"
              v-model="slotProps.data[fieldName]" 
              class="w-full" 
              placeholder="날짜를 선택해주세요"
              dateFormat="yy-mm-dd"
              @update:modelValue="handleDateChange"
              :showIcon="true"
            />
            <InputText 
              v-else
              v-model="slotProps.data[fieldName]" 
              class="w-full" 
              placeholder="입력해주세요"
              @input="handleInputChange" 
            />
          </template>
        </Column>
      </DataTable>

      <div class="text-sm text-gray-600">
        총 {{ rows.length }}건의 데이터
        <span v-if="Object.keys(mapper).some(field => isDateColumn(field))" class="ml-2 text-blue-600">
        </span>
      </div>
    </div>
  </div>
</template>