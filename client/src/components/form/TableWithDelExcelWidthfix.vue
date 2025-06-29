<script setup>
import { ref, watch, defineEmits } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { h } from 'vue';


const emit = defineEmits(['row-click']);

const selectedWDE = ref([]); // single일 경우

watch(selectedWDE, (newVal) => {
  if (newVal) {
    // console.log('✅ 선택된 제품:', newVal);
    emit('row-click', newVal);
  }
});

const props = defineProps({
    data: {
        type: Array,  // ✅ Object가 아니라 Array로 해야 함 (Array of objects)
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
      default: () => []  // ✅ 기본값 빈 배열
    },
    scrollHeight: {             // 부모에서 설정할수있게 추가했습니다
    type: String,
    default: '400px'
    },
    tableStyle: {
    type: String, 
    default: 'width: 100%; table-layout: fixed;' 
    }  
});


// 테이블에 보여줄 제품 데이터 (예시 데이터)
const itemsWDE = ref([]);

// 타입 검증과 값 존재 검증을 해서 값이 있을 때 데이터 추가..
// 문제 있으면 바로 빈배열..
watch(
  () => props.data,
  (newVal) => {
    if(props.columns.length > 0) return; // columns가 있을 경우 watch 종료하고 존재하는 컬럼 사용..
    
    if (Array.isArray(newVal) && newVal.length > 0) {
      itemsWDE.value = Object.keys(newVal[0]);
    } else  {
      itemsWDE.value = [];
    }
  },
  { immediate: true }
);

// 컬럼이 바뀌면 해당 컬럼 목록으로 바꾸기..?
watch(
  () => props.columns,
  (newVal) => {
    if (newVal.length > 0 ) {
      itemsWDE.value = newVal;
    } else if(Array.isArray(props.data) && props.data.length > 0){
      itemsWDE.value = Object.keys(props.data[0]);
    }else {
      itemsWDE.value = [];
    }
  },
  { immediate: true }
);

// 특정 컬럼 클릭 이벤트 
const prdrCodeTemplate = (rowData) => {
  return h(
    'a',
    {
      class: 'text-blue-600 hover:underline cursor-pointer',
      onClick: () => emit('row-click', rowData)
    },
    rowData.prdr_code
  );
};
</script>

<template>
    <!-- 📋 검색 조회 테이블 영역 -->
    <div class="card" style="margin-bottom: 1rem;">
        <!-- 테이블 상단 (타이틀 + 엑셀 다운로드 버튼) -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">{{ title }}</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="삭제" severity="danger" class="min-w-fit whitespace-nowrap" />
                    <!-- <Button label="엑셀 다운로드" severity="success" class="min-w-fit whitespace-nowrap" outlined /> -->
                </div>
            </div>
        </div>

        <!-- DataTable (PrimeVue) -->
        <DataTable
            v-model:selection="selectedWDE"
            :value="data"
            :dataKey="dataKey"
            showGridlines
            :scrollHeight="scrollHeight"
            :tableStyle="tableStyle"
            tableStyle="min-width: 50rem"
        >
            <Column selectionMode="single" headerStyle="width: 3rem" />

            <!-- 동적 컬럼 생성 -->
            <Column
                v-for="item in itemsWDE"
                :key="item"
                :field="item"
                :header="mapper[item] ?? item"
                :body="item === 'prdr_code' ? prdrCodeTemplate : undefined"
            />
        </DataTable>
    </div>
</template>


<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>