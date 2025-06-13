<script setup>
import { ref, watch, computed, defineEmits } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
    data: {
        type: Array,
        required: true,
        default: () => []
    },
    dataKey: {
        type: String,
        default: 'id'
    },
    mapper: {
        type: Object,
        required: true,
        default: () => ({})
    },
    title: {
        type: String,
        default: '목록'
    },
    columns: {
        type: Array,
        default: () => []
    }
});
// 테이블에 보여줄 제품 데이터
const emit = defineEmits(['selection-change', 'updated', 'delete', 'export']);
const selectedWDEeiqchk = ref([]);
const dynamicColumns = ref([]);
// 데이터가 바뀔 때마다 열 추출
watch(
    () => props.data,
    (newVal) => {
        if (newVal && Array.isArray(newVal) && newVal.length > 0) {
            dynamicColumns.value = Object.keys(newVal[0]);
        } else {
            dynamicColumns.value = [];
        }
    },
    { immediate: true }
);

const onRowSelect = (event) => {
    console.log('행 선택됨:', event.data);
    console.log('현재 선택된 항목들:', selectedWDEeiqchk.value);
    emit('selection-change', selectedWDEeiqchk.value);  // 전체 선택 배열 보내기
};

const onRowUnselect = (event) => {
    console.log('행 선택 해제:', event.data);
    console.log('현재 선택된 항목들:', selectedWDEeiqchk.value);
    emit('selection-change', selectedWDEeiqchk.value);  // 전체 선택 배열 보내기
};

// 선택 초기화 메서드
const clearSelection = () => {
    selectedWDEeiqchk.value = [];
    emit('selection-change', []);  // 부모한테도 알려주기
};

const deleteSelected = () => {
    if (selectedWDEeiqchk.value) {
        console.log('삭제 요청:', selectedWDEeiqchk.value);
        emit('delete', selectedWDEeiqchk.value);
    }
};

defineExpose({
    clearSelection
});

const exportToExcel = () => {
    console.log('엑셀 다운로드 요청');
    emit('export', props.data);
};

</script>

<template>
    <!-- 설비 테이블 영역 -->
    <div class="card" style="margin-bottom: 1rem;">
        <!-- 테이블 상단 (타이틀 + 엑셀 다운로드 버튼) -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">{{ title || '설비 목록' }}</div>
                    <div class="text-sm text-gray-500 mt-1">총 {{ data.length }}건</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="삭제" severity="danger" class="min-w-fit whitespace-nowrap" 
                            @click="deleteSelected" :disabled="!selectedWDEeiqchk || selectedWDEeiqchk.length == 0" />
                    <Button label="엑셀 다운로드" severity="success" class="min-w-fit whitespace-nowrap" 
                            outlined @click="exportToExcel" />
                </div>
            </div>
        </div>

        <!-- 데이터 없을 때 표시 -->
        <div v-if="!data || data.length === 0" class="text-center p-8 text-gray-500">
            <p>표시할 데이터가 없습니다.</p>
            <p class="text-sm mt-2">검색 조건을 확인하거나 새로운 설비를 등록해주세요.</p>
        </div>

        <!-- DataTable (PrimeVue) -->
        <DataTable
            v-else
            v-model:selection="selectedWDEeiqchk"
            :value="data"
            :dataKey="dataKey"
            showGridlines
            scrollable
            scrollHeight="400px"
            tableStyle="min-width: 50rem"
            selectionMode="multiple"
            @row-select="onRowSelect"
            @row-unselect="onRowUnselect"
        >   
            <!-- 다중 선택 컬럼 -->
            <Column selectionMode="multiple" headerStyle="width: 3rem" />

            <!-- 고정 컬럼들 (props.columns가 있으면 사용) -->
            <Column
                v-if="columns && columns.length > 0"
                v-for="col in columns"
                :key="col"
                :field="col"
                :header="mapper[col] ?? col"
                sortable
            />

            <!-- 동적 컬럼 생성 (columns가 없으면 자동 생성) -->
            <Column
                v-if="!columns || columns.length === 0"
                v-for="item in dynamicColumns"
                :key="item"
                :field="item"
                :header="mapper[item] ?? item"
                sortable
            />
        </DataTable>
        <!-- 선택된 행 정보 표시 -->
        <div v-if="selectedWDEeiqchk && selectedWDEeiqchk.length > 0" class="mt-4 p-3 bg-blue-50 rounded">
            <p class="text-sm text-blue-600">
                선택된 설비: {{ selectedWDEeiqchk.length }}개
                <span v-if="selectedWDEeiqchk.length === 1" class="ml-2">
                    ({{ selectedWDEeiqchk[0][dataKey] }} - 수정 모드)
                </span>
                <span v-else class="ml-2">
                    (다중 선택 - 삭제만 가능)
                </span>
            </p>
        </div>
    </div>
</template>


<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
