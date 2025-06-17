<script setup>
import { ref, watch, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
    dataKey: {
        type: String,
        default: 'id'
    },
    title: {
        type: String,
        default: ''
    },
    columns: {
        type: Array,
        default: [],
    },
    subData: {
        type: Array,
        default: [],
    }
});

const emit = defineEmits(['update:subData']);

onMounted(() => {
    
})

// 타입 검증과 값 존재 검증
watch(
    () => props.subData,
    (newVal) => {
        // 공정 데이터는 읽기 전용이므로 별도 처리 없음
        console.log('공정 목록 업데이트:', newVal);
    },
    { immediate: true }
);

</script>
<style scoped>

</style>
<template>
    <!-- 공정 목록 테이블 영역 -->
    <div class="card mt-6">
        <!-- 테이블 상단 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <!-- <div class="font-semibold text-2xl">{{ title }}({{ subData[0].line_code  }}, {{ subData[0].line_name }})</div> -->
                    <div class="font-semibold text-2xl">{{ title }}</div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">
                        총 {{ subData.length }}개 공정
                    </span>
                </div>
            </div>
        </div>

        <!-- DataTable (PrimeVue) -->
        <DataTable 
            :value="subData" 
            :dataKey="dataKey" 
            showGridlines 
            scrollable
            scrollHeight="400px" 
            tableStyle="min-width: 50rem"
            :emptyMessage="subData.length === 0 ? '생산계획과 제품을 선택하면 공정 목록이 표시됩니다.' : '공정 정보가 없습니다.'">
            
            <!-- <Column field="line_code" header="라인코드" style="width: 120px">
                <template #body="slotProps">
                    <span class="font-mono text-blue-600">{{ slotProps.data.line_code }}</span>
                </template>
            </Column>

            <Column field="line_name" header="라인명" style="width: 150px">
                <template #body="slotProps">
                    <span class="font-medium">{{ slotProps.data.line_name }}</span>
                </template>
            </Column>

            <Column field="line_type" header="라인타입" style="width: 100px">
                <template #body="slotProps">
                    {{ slotProps.data.line_type }}
                </template>
            </Column> -->

            <Column field="process_no" header="공정순서" style="width: 6%">
                <template #body="slotProps">
                    <span class="bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                        {{ slotProps.data.process_no }}
                    </span>
                </template>
            </Column>
            
            <Column field="process_name" header="공정명" style="width: 23.5%">
                <template #body="slotProps">
                    <span class="font-medium text-gray-800">{{ slotProps.data.process_name }}</span>
                </template>
            </Column>

            <!-- <Column field="eq_type" header="설비타입" style="width: 20%">
                <template #body="slotProps">
                    {{ slotProps.data.eq_type }}
                </template>
            </Column> -->

            <Column field="eq_code" header="설비코드" style="width: 23.5%">
                <template #body="slotProps">
                    <span class="font-mono text-purple-600">{{ slotProps.data.eq_code }}</span>
                </template>
            </Column>

            <Column field="eq_name" header="설비명" style="width: 23.5%">
                <template #body="slotProps">
                    {{ slotProps.data.eq_name }}
                </template>
            </Column>

            <Column field="eq_model" header="설비모델" style="width: 23.5%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.eq_model }}</span>
                </template>
            </Column>

            <!-- <Column field="eq_stat" header="설비상태" style="width: 100px">
                <template #body="slotProps">
                    <span 
                        :class="{
                            'status-waiting': slotProps.data.eq_stat === '대기',
                            'status-working': slotProps.data.eq_stat === '가동중',
                            'status-completed': slotProps.data.eq_stat === '정상',
                            'status-stopped': slotProps.data.eq_stat === '고장'
                        }">
                        {{ slotProps.data.eq_stat }}
                    </span>
                </template>
            </Column> -->

            <!-- <Column field="planned_qtt" header="계획수량" style="width: 100px">
                <template #body="slotProps">
                    <span class="font-medium">{{ slotProps.data.planned_qtt?.toLocaleString() }}</span>
                </template>
            </Column> -->

            <!-- <Column field="priority" header="우선순위" style="width: 80px">
                <template #body="slotProps">
                    <span 
                        :class="{
                            'bg-red-100 text-red-800': slotProps.data.priority >= 3,
                            'bg-yellow-100 text-yellow-800': slotProps.data.priority === 2,
                            'bg-green-100 text-green-800': slotProps.data.priority === 1
                        }"
                        class="px-2 py-1 rounded text-sm">
                        {{ slotProps.data.priority }}
                    </span>
                </template>
            </Column> -->
        </DataTable>
    </div>
</template>