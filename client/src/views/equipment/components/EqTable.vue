<template>
    <div class="card mt-6">
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">{{ title }}</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="엑셀 다운로드" severity="success" class="min-w-fit whitespace-nowrap" outlined />
                </div>
            </div>
        </div>

        <DataTable
            v-model:selection="selectedWE"
            :value="data"
            :dataKey="dataKey"
            showGridlines
            scrollable
            scrollHeight="400px"
            tableStyle="min-width: 50rem"
        >
            <Column
                v-for="item in itemsWE"
                :key="item"
                :field="item"
                :header="mapper[item] ?? item"
            />
        </DataTable>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

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
  }
});
// 테이블에 보여줄 제품 데이터
const itemsWE = ref([]);

// 데이터가 바뀔 때마다 열 추출
watch(
    () => props.data,
    (newVal) => {
        if (newVal?.length > 0) {
            itemsWE.value = Object.keys(newVal[0]);
        } else {
            itemsWE.value = [];
        }
    },
    { immediate: true }
);


// DataTable 선택된 행 (선택 모드)
const selectedWE = ref();

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
