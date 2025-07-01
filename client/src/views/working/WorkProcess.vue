<script setup>
import axios from 'axios';
import moment from 'moment';
import { onMounted, ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useWebSocketStore } from '../../stores/websocket';

const wsStore = useWebSocketStore();

// 웹소켓 연결
if (!wsStore.isConnected) {
  wsStore.connect();
}

const route = useRoute();
const wkoCode = route.params.wko_code;

const data = ref([]);  // 빈 배열로 초기화
const dataKey = ref('id');

const prdrCode = ref('');


// 공정 목록을 불러오는 함수
const loadProcess = async () => {
    try {
        const response = await axios.get(`/api/work/${wkoCode}/process`);
        const result = await response.data;
        if (result.result_code === "SUCCESS") {
            // 공정 목록 가져오기 성공 시 테이블 값 설정, 공정명과 설비를 제외한 나머지 필드는 널 체크
            const processedData = result.data.map(element => ({
                ...element,
                po_name: element.po_name || '-',
                proc_rate: element.proc_rate || 0,
                eq_code: element.eq_code || '-',
                eq_name: element.eq_name || '-',
                start_date: element.start_date ? moment(element.start_date).format('YYYY-MM-DD HH:mm:ss') : '-',
                end_date: element.end_date ? moment(element.end_date).format('YYYY-MM-DD HH:mm:ss') : '-',
                input_qtt: element.input_qtt || '-',
                def_qtt: element.def_qtt || '-',
                make_qtt: element.make_qtt || '-'
            }));
            
            data.value = processedData;
            alert('오류가 발생했습니다. 다시 시도해주세요.');
            
        } else {
            alert('오류가 발생했습니다. 다시 시도해주세요.');
            data.value = [];
        }
    } catch (error) {
        alert('오류가 발생했습니다. 다시 시도해주세요.');
        data.value = [];
    }
}

// 공정 데이터 업데이트 헬퍼 함수
const updateProcessData = (processId, updates) => {
    const processIndex = data.value.findIndex(
        process => process.prdr_d_code === processId
    );
    
    if (processIndex !== -1) {
        // 방법 1: 전체 배열을 새로 만들어서 할당 (가장 안전)
        const newData = [...data.value];
        newData[processIndex] = {
            ...newData[processIndex],
            ...updates
        };
        data.value = newData;
        
        // 또는 방법 2: nextTick 사용
        // Object.assign(data.value[processIndex], updates);
        // await nextTick();
        
        return data.value[processIndex];
    }
    return null;
};

// 웹소켓 메시지 감지해서 진행률 업데이트
watch(() => wsStore.messages, (messages) => {
    const latest = messages[messages.length - 1];
    
    if (latest?.type === 'PROCESS_UPDATE') {
        
        const updatedProcess = updateProcessData(latest.processId, {
            proc_rate: latest.progress,
            make_qtt: latest.makeQtt || latest.make_qtt // 둘 다 체크
        });
    }
    else if (latest?.type === 'PROCESS_COMPLETED') {
        
        const updatedProcess = updateProcessData(latest.processId, {
            proc_rate: latest.progress,
            end_date: moment(latest.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            make_qtt: latest.makeQtt || latest.make_qtt
        });
    }
    else if (latest?.type === 'PROCESS_STARTED') {
        
        const updatedProcess = updateProcessData(latest.processId, {
            start_date: moment(latest.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            proc_rate: latest.progress || 0,
            input_qtt: latest.inputQtt || latest.input_qtt
        });
        
        if (updatedProcess) {
            alert(`${updatedProcess.po_name} 공정 시작`);
        }
    }
}, { deep: true });

// 디버깅을 위한 데이터 변화 감지
watch(() => data.value, (newData) => {
    console.log('📊 데이터 변경됨:', newData);
}, { deep: true });

onMounted(() => {
    console.log('🚀 컴포넌트 마운트됨');
    if (wkoCode) {
        loadProcess();
    } else {
        console.warn('작업지시서 코드가 없습니다.');
    }
});

</script>

<template>
    <!-- 공정 목록 테이블 영역 -->
    <div class="card mt-6">
        <!-- 테이블 상단 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">{{ title ?? '작업진행' }}</div>
                </div>
            </div>
        </div>

        <!-- 디버깅 정보 (개발 중에만) -->
        <div v-if="false" class="mb-4 p-2 bg-gray-100 rounded text-sm">
            <div>데이터 개수: {{ data.length }}</div>
            <div>최근 메시지: {{ wsStore.messages[wsStore.messages.length - 1]?.type }}</div>
        </div>

        <!-- DataTable (PrimeVue) -->
        <DataTable 
            :value="data" 
            :dataKey="dataKey" 
            showGridlines 
            scrollable
            scrollHeight="100%" 
            tableStyle="min-width: 50rem"
            :emptyMessage="data.length === 0 ? '생산계획과 제품을 선택하면 공정 목록이 표시됩니다.' : '공정 정보가 없습니다.'">
            
            <Column field="po_name" header="공정명" style="width: 10%">
                <template #body="slotProps">
                    <span class="font-medium text-gray-800">{{ slotProps.data.po_name }}</span>
                </template>
            </Column>
            
            <Column field="proc_rate" header="진행률" style="width: 24%">
                <template #body="slotProps">
                    <div class="relative w-full h-6 bg-gray-300 rounded overflow-hidden">
                        <!-- 중앙 고정 텍스트 -->
                        <div class="absolute inset-0 flex items-center justify-center text-sm font-semibold text-black">
                            {{ slotProps.data.proc_rate }}%
                        </div>

                        <!-- 실제 진행 바 -->
                        <div
                            class="h-full bg-green-500 transition-all duration-300"
                            :style="{ width: slotProps.data.proc_rate + '%' }"
                        ></div>
                    </div>
                </template>
            </Column>

            <Column field="eq_code" header="설비" style="width: 20%">
                <template #body="slotProps">
                    <div class="flex items-center gap-2">
                        <Button 
                            :label="slotProps.data.eq_code + ' ' + slotProps.data.eq_name" 
                            severity="secondary" 
                            @click="$router.push(`/work/detail/${wkoCode}/${slotProps.data.eq_code}`)" 
                            class="flex-1" 
                        />
                    </div>
                </template>
            </Column>

            <Column field="start_date" header="시작일시" style="width: 12%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.start_date }}</span>
                </template>
            </Column>

            <Column field="end_date" header="종료일시" style="width: 12%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.end_date }}</span>
                </template>
            </Column>

            <Column field="input_qtt" header="투입량" style="width: 7%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.input_qtt }}</span>
                </template>
            </Column>

            <Column field="def_qtt" header="불량량" style="width: 7%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.def_qtt }}</span>
                </template>
            </Column>

            <Column field="make_qtt" header="생산량" style="width: 7%">
                <template #body="slotProps">
                    <span class="text-gray-600 font-medium">
                        {{ slotProps.data.make_qtt }}
                    </span>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style>

</style>