<script setup>
import { ref, onUnmounted, onMounted, watch, computed } from 'vue';
import { useWebSocketStore } from '@/stores/websocket.js';
import Button from 'primevue/button';
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import moment from 'moment';

const props = defineProps({
  detail: {
    type: Object,
    required: true
  },
  wkoCode: {
    type: String,
    required: true
  }
});

// Pinia Store 사용
const wsStore = useWebSocketStore();

// props.detail을 복사하여 로컬 상태로 관리
const localDetail = ref({ ...props.detail });

// props가 변경되면 로컬 상태도 업데이트
watch(() => props.detail, (newDetail) => {
  localDetail.value = { ...newDetail };
}, { deep: true });

const datas = ref({ 
  prdr_code: '', 
  wko_code: props.wkoCode, 
  line_code: props.detail.line_code, 
  wko_qtt: props.detail.wko_qtt, 
  prod_code: props.detail.prod_code, 
  eq_code: props.detail.eq_code 
});

// 작업시작 버튼
const startProcess = async () => {
  await wsStore.startProcess(datas.value);
};

// 데이터 업데이트 헬퍼 함수
const updateLocalDetail = (updates) => {
  localDetail.value = {
    ...localDetail.value,
    ...updates
  };
};

onMounted(() => {
  // 이미 연결되어 있지 않으면 연결
  if (!wsStore.isConnected) {
    wsStore.connect();
  }
  console.log('🚀 설비 상세 컴포넌트 마운트됨', props.detail);
});

const formattedStartDate = computed({
  get() {
    const raw = localDetail.value.start_date;
    return raw ? moment(raw).format('YYYY-MM-DD HH:mm:ss') : '';
  },
  set(val) {
    localDetail.value.start_date = val; // 값 변경 시 원본도 갱신
  }
});

const formattedEndDate = computed({
  get() {
    const raw = localDetail.value.end_date;
    return raw ? moment(raw).format('YYYY-MM-DD HH:mm:ss') : '';
  },
  set(val) {
    localDetail.value.end_date = val;
  }
});

// 웹소켓 메시지 감지해서 진행률 업데이트
watch(() => wsStore.messages, (messages) => {
  const latest = messages[messages.length - 1];
  
  if (!latest) return;
  // 받은 메시지가 현재 페이지의 것인지 확인
  if (latest?.wkoCode && latest.wkoCode !== props.wkoCode) {
    return; // 현재 작업지시와 관련 없는 메시지는 무시
  }
  // 현재 받은 메시지가 지금 페이지의 조회한 장비와 관련 있는지 확인
  if (latest?.eqCode && latest.eqCode !== props.detail.eq_code) {
    return; // 현재 장비와 관련 없는 메시지는 무시
  }
  if (latest?.type === 'PRDRD_CREATED') { // PRDR 생성
  }
  else if (latest?.type === 'PROCESS_COMPLETED') {
    updateLocalDetail({
      end_date: latest.timestamp,
      total_time: latest.total_time,
      proc_rate: 100, // 완료 시 100%
      make_qtt: latest.makeQtt || latest.make_qtt
    });
  }
  else if (latest?.type === 'PROCESS_STARTED') {
    updateLocalDetail({
      input_qtt: latest.inputQtt || latest.input_qtt,
      start_date: latest.timestamp,
      proc_rate: 0 // 시작 시 0%
    });
  }
  else if (latest?.type === 'PROCESS_UPDATE') {
    updateLocalDetail({
      proc_rate: latest.progress,
      make_qtt: latest.makeQtt || latest.make_qtt
    });
  }
  else if (latest?.type === 'MATERIAL_SHORTAGE') {
    console.warn('⚠️ 자재 부족 메시지 수신:', latest.message);
    // 자재 부족 처리 로직 추가 가능
    alert(`생산에 필요한 자재가 부족합니다.\n${latest.message}`);
  }
  else if (latest?.type === 'ERROR') {
    console.error('❌ 오류 메시지 수신:', latest.message);
    // 오류 처리 로직 추가 가능
  }
  else {
    console.warn('❓ 알 수 없는 메시지 타입:', latest.type);
  }
}, { deep: true });

// 달성률 계산 (computed로 자동 계산)
const performanceRate = computed(() => {
  const makeQtt = parseFloat(localDetail.value.make_qtt) || 0;
  const wkoQtt = parseFloat(localDetail.value.wko_qtt) || 0;
  
  if (wkoQtt === 0) return '0.00';
  
  const rate = (makeQtt / wkoQtt * 100).toFixed(2);
  return rate;
});

// 달성률을 localDetail에 반영
watch(performanceRate, (newRate) => {
  localDetail.value.perform_rate = newRate + '%';
});

onUnmounted(() => {
  // 컴포넌트가 언마운트되어도 연결은 유지 (전역)
  // 필요시에만 wsStore.disconnect();
});
</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <!-- 디버깅 정보 (개발 중에만 표시) -->
    <div v-if="false" class="mb-4 p-2 bg-blue-100 rounded text-sm">
      <div>현재 설비: {{ props.detail.eq_code }}</div>
      <div>작업지시: {{ props.wkoCode }}</div>
      <div>생산수량: {{ localDetail.make_qtt }}</div>
      <div>달성률: {{ performanceRate }}%</div>
      <div>최근 메시지: {{ wsStore.messages[wsStore.messages.length - 1]?.type }}</div>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div class="font-semibold text-2xl">실적 정보</div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="공정명" v-model="localDetail.po_name" :readonly="true" />
      <LabeledInput label="설비명" v-model="localDetail.eq_name" :readonly="true" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="제품명" v-model="localDetail.prod_name" :readonly="true" />
      <LabeledInput label="라인코드" v-model="localDetail.line_code" :readonly="true" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="작업지시명" v-model="localDetail.wko_name" :readonly="true" />
      <LabeledInput label="작업지시코드" v-model="localDetail.wko_code" :readonly="true" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="시작시간" v-model="formattedStartDate" :readonly="true" />
      <LabeledInput label="종료시간" v-model="formattedEndDate"  :readonly="true" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="투입량" v-model="localDetail.input_qtt" :readonly="true" />
      <LabeledInput label="지시량" v-model="localDetail.wko_qtt" :readonly="true" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput 
        label="생산수량" 
        v-model="localDetail.make_qtt" 
        :readonly="true" 
        class="font-medium"
      />
      <LabeledInput label="불량수량" v-model="localDetail.def_qtt" :readonly="true" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput 
        label="진행률" 
        v-model="localDetail.perform_rate" 
        :readonly="true" 
      />
    </div>

    <div class="flex justify-center gap-3 mt-4">  
      <Button 
        label="뒤로가기" 
        severity="secondary" 
        raised 
        @click="$router.push(`/work/${props.wkoCode}`)" 
      />
      <Button 
        label="작업시작" 
        severity="success" 
        raised 
        @click="startProcess()" 
      /> 
      <Button 
        label="작업종료" 
        severity="contrast" 
        raised 
      />
    </div>

  </div>
</template>