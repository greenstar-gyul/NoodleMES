<script setup>
import { ref, watch, defineEmits, defineProps } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const emit = defineEmits(['row-click']);
const selectedWDE = ref([]);

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
    type: Array
  },
  scrollHeight: {
    type: String,
    default: '450px'
  }
});

const itemsWDE = ref([]);

// ⚙️ 컬럼 자동 생성
watch(
  () => props.data,
  (newVal) => {
    if (props.columns?.length > 0) return;
    if (Array.isArray(newVal) && newVal.length > 0) {
      itemsWDE.value = Object.keys(newVal[0]);
    } else {
      itemsWDE.value = [];
    }
  },
  { immediate: true }
);

watch(
  () => props.columns,
  (newVal) => {
    if (newVal?.length > 0) {
      itemsWDE.value = newVal;
    } else if (Array.isArray(props.data) && props.data.length > 0) {
      itemsWDE.value = Object.keys(props.data[0]);
    } else {
      itemsWDE.value = [];
    }
  },
  { immediate: true }
);

// ✅ 행 클릭 시 상위로 이벤트 emit
const handleRowClick = (event) => {
  emit('row-click', event.data);
};
</script>

<template>
  <div class="card" style="margin-bottom: 0">
    <!-- 타이틀 + 버튼 -->
    <div class="grid grid-cols-1 gap-4 mb-4">
      <div class="flex justify-between">
        <div class="font-semibold text-2xl">{{ title }}</div>
        <div class="flex items-center gap-2">
          <Button label="삭제" severity="danger" class="min-w-fit whitespace-nowrap" />
          <!-- <Button label="엑셀 다운로드" severity="success" class="min-w-fit whitespace-nowrap" outlined /> -->
        </div>
      </div>
    </div>

    <!-- 테이블 -->
    <div :style="`height: ${scrollHeight}; overflow-y: auto;`">
      <DataTable
        v-model:selection="selectedWDE"
        :value="data"
        :dataKey="dataKey"
        scrollable
        scrollHeight="flex"
        showGridlines
        tableStyle="min-width: 50rem"
        @rowClick="handleRowClick"
      >
        <Column selectionMode="single" headerStyle="width: 3rem" />
        <Column
          v-for="item in itemsWDE"
          :key="item"
          :field="item"
          :header="mapper[item] ?? item"
        />
      </DataTable>
    </div>
  </div>
</template>

