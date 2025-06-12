<template>
    <!-- 📋 검색 조회 테이블 영역 -->
    <div class="card mt-6">
        <!-- 테이블 상단 (타이틀 + 엑셀 다운로드 버튼) -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">{{ title }}</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="하위 자재 추가" severity="success" class="min-w-fit whitespace-nowrap" v-on:click="$emit('open-popup')" />
                    <Button label="삭제" severity="danger" class="min-w-fit whitespace-nowrap" />
                </div>
            </div>
        </div>

        <!-- DataTable (PrimeVue) -->
        <DataTable
            v-model:selection="selectedWAD"
            :value="data"
            :dataKey="dataKey"
            showGridlines
            scrollable
            scrollHeight="400px"
            tableStyle="min-width: 50rem"
        >
            <Column selectionMode="multiple" headerStyle="width: 3rem" />

            <Column
                v-for="item in itemsWAD"
                :key="item"
                :field="item"
                :header="mapper[item] ?? item"
            />

            <!-- 동적 컬럼 생성 -->
            <!-- <Column
                v-for="item in itemsWAD"
                :key="item"
                :field="item"
                :header="mapper[item] ?? item"
            /> -->
        </DataTable>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

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
        default: [],
    }
});

/* 
// computed로 대체?
// 테이블에 보여줄 제품 데이터 (예시 데이터)
const itemsWAD = ref([]);

// 데이터가 바뀔 때마다 열 추출
watch(
    () => props.data,
    (newVal) => {
        if (newVal?.length > 0) {
            itemsWAD.value = Object.keys(newVal[0]);
        } else {
            itemsWAD.value = [];
        }
    },
    { immediate: true }
);

// watch 대신 computed로 계산..
const itemsWAD = computed(() => {
    if (props.data?.length > 0) {
        return Object.keys(props.data[0]);
    }
    return [];
});
*/

const itemsWAD = ref([]);

// 타입 검증과 값 존재 검증을 해서 값이 있을 때 데이터 추가..
// 문제 있으면 바로 빈배열..
watch(
  () => props.data,
  (newVal) => {
    if(props.columns.length > 0) return; // columns가 있을 경우 watch 종료하고 존재하는 컬럼 사용..
    
    if (Array.isArray(newVal) && newVal.length > 0) {
      itemsWAD.value = Object.keys(newVal[0]);
    } else  {
      itemsWAD.value = [];
    }
  },
  { immediate: true }
);

// 컬럼이 바뀌면 해당 컬럼 목록으로 바꾸기..?
watch(
  () => props.columns,
  (newVal) => {
    if (newVal.length > 0 ) {
      itemsWAD.value = newVal;
    } else if(Array.isArray(props.data) && props.data.length > 0){
      itemsWAD.value = Object.keys(props.data[0]);
    }else {
      itemsWAD.value = [];
    }
  },
  { immediate: true }
);


// DataTable 선택된 행 (선택 모드)
const selectedWAD = ref([]);

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
