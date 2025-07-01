<script setup>
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';

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
    default: '400px'
  },
  columns: {
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

// 간단한 날짜 컬럼 확인 함수
const isDateColumn = (fieldName) => {
  return fieldName && fieldName.toLowerCase().includes('date');
};

// 날짜 변환 함수들 (더 안전하게)
const formatDateForDB = (date) => {
  if (!date) return null;
  
  try {
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    // 문자열인 경우 그대로 반환
    if (typeof date === 'string') {
      return date;
    }
    
    return null;
  } catch (error) {
    // console.warn('날짜 변환 실패:', date, error);
    alert('날짜 변환 실패: ' + date);
    return null;
  }
};

const parseDateFromDB = (dateString) => {
  if (!dateString) return null;
  
  try {
    // 이미 Date 객체인 경우
    if (dateString instanceof Date) {
      return isNaN(dateString.getTime()) ? null : dateString;
    }
    
    // 문자열인 경우 Date 객체로 변환
    if (typeof dateString === 'string') {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  } catch (error) {
    // console.warn('날짜 파싱 실패:', dateString, error);
    alert('날짜 파싱 실패: ' + dateString);
    return null;
  }
};

// 초기 데이터 로딩 및 변경사항 감지
watch(
  () => props.data,
  (newData) => {
    if (!Array.isArray(newData)) {
      rows.value = [];
      return;
    }
    
    rows.value = newData.map(row => {
      const processedRow = { ...row };
      
      // 날짜 컬럼만 Date 객체로 변환
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
  // console.log('새 행 추가됨! (저장은 수동으로)');
}

// 선택된 행 삭제
const deleteSelected = () => {
  if (selectedRows.value.length === 0) {
    // console.log('삭제할 행을 선택해주세요!');
    alert('삭제할 행을 선택해주세요!');
    return;
  }

  rows.value = rows.value.filter(row => !selectedRows.value.includes(row));
  selectedRows.value = [];
  // console.log('선택된 행이 삭제되었습니다! (저장은 수동으로)');
  alert('선택된 행이 삭제되었습니다!');
}

const loadEquipment = () => {
  emit('loadEquipment');
}

const update = () => {
  emit('update');
}

const handleDataChange = () => {
  // console.log('데이터 변경 감지 - 로컬에서만 처리');
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
      <!-- 타이틀 및 버튼 영역 -->
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

      <!-- 데이터 테이블 -->
      <DataTable v-model:selection="selectedRows" :value="rows" :dataKey="dataKey" selectionMode="multiple"
        showGridlines scrollable :scrollHeight="scrollHeight" tableStyle="min-width: 50rem">
        <Column selectionMode="multiple" headerStyle="width: 3rem" />

        <Column v-for="fieldName in Object.keys(mapper)" :key="fieldName" :field="fieldName"
          :header="mapper[fieldName]">
          <template #body="slotProps">
            <!-- 날짜 컬럼인 경우 Calendar 컴포넌트 사용 -->
            <Calendar 
              v-if="isDateColumn(fieldName)"
              v-model="slotProps.data[fieldName]" 
              class="w-full" 
              placeholder="날짜를 선택해주세요"
              dateFormat="yy-mm-dd"
              @update:modelValue="handleDateChange"
              :showIcon="true"
            />
            <!-- 일반 텍스트 컬럼 -->
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

      <!-- 현재 데이터 개수 표시 -->
      <div class="text-sm text-gray-600">
        총 {{ rows.length }}건의 데이터
        <span v-if="Object.keys(mapper).some(field => isDateColumn(field))" class="ml-2 text-blue-600">
        </span>
      </div>
    </div>
  </div>
</template>