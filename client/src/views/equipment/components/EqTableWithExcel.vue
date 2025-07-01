<template>
  <div class="card mt-6">
    <div class="grid grid-cols-1 gap-4 mb-4">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold text-2xl">{{ title }}</div>
        </div>
        <div class="flex items-center gap-2 flex-nowrap">
          <Button label="수정" severity="info" class="min-w-fit whitespace-nowrap" outlined @click="crctEqii" />
        </div>
      </div>
    </div>

    <DataTable v-model:selection="selectedWE" :value="data" :dataKey="dataKey" showGridlines scrollable
      scrollHeight="400px" tableStyle="min-width: 50rem">
      <Column selectionMode="multiple" headerStyle="width: 3rem" />

      <Column v-for="item in itemsWE" :key="item" :field="item" :header="mapper[item] ?? item">

        <template #body="slotProps">
          <span v-if="['reqdate', 'deadline'].includes(item)">
            {{ formatDate(slotProps.data[item]) }}
          </span>
          <span v-else>
            {{ slotProps.data[item] }}
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import moment from 'moment';

const formatDate = (val) => {
  return val ? moment(val).format('YYYY-MM-DD ') : '';
};

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  dataKey: {
    type: String,
    default: 'id'
  },
  mapper: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  columns: {
    type: Array,
    default: []
  }
});

const itemsWE = ref([]);

// 타입 검증과 값 존재 검증을 해서 값이 있을 때 데이터 추가
// 문제 있으면 바로 빈배열
watch(
  () => props.data,
  (newVal) => {
    if (props.columns.length > 0) return;

    if (Array.isArray(newVal) && newVal.length > 0) {
      itemsWE.value = Object.keys(newVal[0]);
    } else {
      itemsWE.value = [];
    }
  },
  { immediate: true }
);

// 컬럼이 바뀌면 해당 컬럼 목록으로 바꾸기
watch(
  () => props.columns,
  (newVal) => {
    if (newVal.length > 0) {
      itemsWE.value = newVal;
    } else if (Array.isArray(props.data) && props.data.length > 0) {
      itemsWE.value = Object.keys(props.data[0]);
    } else {
      itemsWE.value = [];
    }
  },
  { immediate: true }
);

// 수정 버튼 클릭 시 호출되는 함수 : 해당 행 정보를 부모에게 보내기
const emit = defineEmits(['crctEqii']);
const crctEqii = () => {
  if (selectedWE.value && selectedWE.value.length > 0) {
    emit('crctEqii', selectedWE.value);
  } else {
    alert('수정할 행을 선택해주세요.');
  }
};

// DataTable 선택된 행 (선택 모드)
const selectedWE = ref();

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
