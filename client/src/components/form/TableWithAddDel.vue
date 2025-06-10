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
                v-for="col in columns"
                :key="col"
                :field="col"
                :header="mapper[col] ?? col"
            />

            <!-- 동적 컬럼 생성 -->
            <Column
                v-for="item in itemsWAD"
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
        type: Array,  // ✅ Object가 아니라 Array로 해야 함 (Array of objects)
        required: true
    },
    dataKey: {
        type: String,
        default: 'id'
    },
    mapper: {
        type: Array,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    columns: {
        type: Array,
    }
});
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


// DataTable 선택된 행 (선택 모드)
const selectedWAD = ref([]);

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
