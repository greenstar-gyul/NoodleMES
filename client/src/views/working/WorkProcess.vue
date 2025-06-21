<script setup>
import axios from 'axios';
import moment from 'moment';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useWebSocketStore } from '../../stores/websocket';
// console.log(moment('2025.06.16', 'YYYY.MM.DD').format('YYYY년 MM월 DD일'));

const wsStore = useWebSocketStore();

// 웹소켓 연결
if (!wsStore.isConnected) {
  wsStore.connect();
}

const route = useRoute();
const wkoCode = route.params.wko_code;

const data = ref({});
const dataKey = ref('id');

const prdrCode = ref('');

console.log(wkoCode);

// 공정 목록을 불러오는 함수
const loadProcess = async () => {
    try {
        const response = await axios.get(`/api/work/${wkoCode}/process`);
        const result = await response.data;
        if (result.result_code === "SUCCESS") {
            // 공정 목록 가져오기 성공 시 테이블 값 설정, 공정명과 설비를 제외한 나머지 필드는 널 체크
            await result.data.forEach(element => {
                element.po_name = element.po_name || '-',
                element.proc_rate = element.proc_rate || 0,
                element.eq_code = element.eq_code || '-',
                element.eq_name = element.eq_name || '-',
                element.start_date = element.start_date ? moment(element.start_date).format('YYYY-MM-DD HH:mm:ss') : '-',
                element.end_date = element.end_date ? moment(element.end_date).format('YYYY-MM-DD HH:mm:ss') : '-',
                element.input_qtt = element.input_qtt || '-',
                element.def_qtt = element.def_qtt || '-',
                element.make_qtt = element.make_qtt || '-'
            })
            data.value = result.data;
            console.log('공정 목록 불러오기 성공:', data.value);
            
        } else {
            console.error('공정 목록 불러오기 실패:', result.message);
            data.value = {};
        }
    } catch (error) {
        console.error('공정 목록 불러오기 중 오류 발생:', error);
        data.value = {};
    }
}

// 웹소켓 메시지 감지해서 진행률 업데이트
watch(() => wsStore.messages, (messages) => {
  const latest = messages[messages.length - 1];
  
  if (latest?.type === 'PROCESS_UPDATE') {
    // 해당하는 공정의 진행률 업데이트
    const processIndex = data.value.findIndex(
      process => process.prdr_d_code === latest.processId
    );
    
    if (processIndex !== -1) {
      data.value[processIndex].proc_rate = latest.progress;
      console.log(`🔄 ${data.value[processIndex].po_name} 진행률: ${latest.progress}%`);
    }
  }
  else if (latest?.type === 'PROCESS_COMPLETED') {
    // 공정 완료 메시지 처리
    const processIndex = data.value.findIndex(
      process => process.prdr_d_code === latest.processId
    );
    
    if (processIndex !== -1) {
      data.value[processIndex].proc_rate = 100; // 완료된 공정은 100%로 설정
      data.value[processIndex].end_date = moment(latest.timestamp).format('YYYY-MM-DD HH:mm:ss'); // 완료된 공정은 100%로 설정
      console.log(`✅ ${data.value[processIndex].po_name} 공정 완료`);
    }
  }
  else if (latest?.type === 'PROCESS_STARTED') {
    // 공정 시작 메시지 처리
    const processIndex = data.value.findIndex(
      process => process.prdr_d_code === latest.processId
    );
    
    if (processIndex !== -1) {
      data.value[processIndex].start_date = moment(latest.timestamp).format('YYYY-MM-DD HH:mm:ss'); // 시작일시 업데이트
      console.log(`▶️ ${data.value[processIndex].po_name} 공정 시작`);
    }
  }
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

        <!-- DataTable (PrimeVue) -->
        <DataTable 
            :value="data" 
            :dataKey="dataKey" 
            showGridlines 
            scrollable
            scrollHeight="100%" 
            tableStyle="min-width: 50rem"
            :emptyMessage="data != null ? '생산계획과 제품을 선택하면 공정 목록이 표시됩니다.' : '공정 정보가 없습니다.'">
            
            <Column field="po_name" header="공정명" style="width: 10%">
                <template #body="slotProps">
                    <span class="font-medium text-gray-800">{{ slotProps.data.po_name }}</span>
                </template>
            </Column>
            
            <Column field="proc_rate" header="진행률" style="width: 24%">
                <template #body="slotProps">
                    <!-- <ProgressBar :value="slotProps.data.proc_rate" class="w-full"></ProgressBar> -->
                    <!-- <div class="w-full bg-gray-300 rounded">
                        <div
                        class="bg-green-500 text-white text-center py-1 rounded"
                        :style="{ width: slotProps.data.proc_rate + '%' }"
                        >
                        {{ slotProps.data.proc_rate }}%
                        </div>
                    </div> -->
                    <div class="relative w-full h-6 bg-gray-300 rounded overflow-hidden">
                        <!-- 중앙 고정 텍스트 -->
                        <div class="absolute inset-0 flex items-center justify-center text-sm font-semibold text-black">
                            {{ slotProps.data.proc_rate }}%
                        </div>

                        <!-- 실제 진행 바 -->
                        <div
                            class="h-full bg-green-500"
                            :style="{ width: slotProps.data.proc_rate + '%' }"
                        ></div>
                    </div>


                </template>
            </Column>

            <Column field="eq_code" header="설비" style="width: 20%">
                <template #body="slotProps">
                    <div class="flex items-center gap-2">
                        <!-- <span class="font-medium text-gray-600" v-on:click="$router.push('//')">{{ slotProps.data.eq_code }} - {{ slotProps.data.eq_name }}</span> -->
                        <Button :label="slotProps.data.eq_code + ' ' + slotProps.data.eq_name" severity="secondary" @click="$router.push(`/work/detail/${wkoCode}/${slotProps.data.eq_code}`)" class="flex-1" />
                    </div>
                </template>
            </Column>

            <Column field="start_date" header="시작일시" style="width: 12%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.start_date }}</span>
                </template>
            </Column>

            <Column field="start_date" header="종료일시" style="width: 12%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.end_date }}</span>
                </template>
            </Column>

            <Column field="input_qtt" header="투입량" style="width: 7%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.input_qtt.toLocaleString('ko-KR') }}</span>
                </template>
            </Column>

            <Column field="def_qtt" header="불량량" style="width: 7%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.def_qtt.toLocaleString('ko-KR') }}</span>
                </template>
            </Column>

            <Column field="make_qtt" header="생산량" style="width: 7%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.make_qtt.toLocaleString('ko-KR') }}</span>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
<style>

</style>