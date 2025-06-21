<script setup>
import { ref, onUnmounted, onMounted, watch } from 'vue';
import { useWebSocketStore } from '@/stores/websocket.js';
import Button from 'primevue/button';
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledDateTimePicker from '@/components/registration-bar/LabeledDateTimePicker.vue';

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

// 🚀 Pinia Store 사용
const wsStore = useWebSocketStore();

const datas = ref({ prdr_code: '', wko_code: props.wkoCode, line_code: props.detail.line_code, wko_qtt: props.detail.wko_qtt, prod_code: props.detail.prod_code, eq_code: props.detail.eq_code });

// 작업시작 버튼
const startProcess = async () => {
  const result = await wsStore.startProcess(datas.value);
  console.log('sent', `작업 시작 메시지 전송`, result, wsStore.clientId);
};

onMounted(() => {
  // 이미 연결되어 있지 않으면 연결
  if (!wsStore.isConnected) {
    wsStore.connect();
  }
});

// 웹소켓 메시지 감지해서 진행률 업데이트
watch(() => wsStore.messages, (messages) => {
  const latest = messages[messages.length - 1];
  
  // 받은 메시지가 현재 페이지의 것인지 확인
  if (latest?.wko_code !== props.wkoCode) {
    return; // 현재 작업지시와 관련 없는 메시지는 무시
  }

  // 현재 받은 메시지가 지금 페이지의 조회한 장비와 관련 있는지 확인
  if (latest?.eq_code !== props.detail.eq_code) {
    return; // 현재 장비와 관련 없는 메시지는 무시
  }

  if (latest?.type === 'PRDRD_CREATED') { // PRDR 생성
    console.log('📦 PRDR 생성 메시지 수신:', latest.message);
  }
  else if (latest?.type === 'PROCESS_COMPLETED') {
    props.detail.end_date = latest.end_date; // 종료시간 업데이트
    props.detail.total_time = latest.total_time; // 소요시간 업데이트
  }
  else if (latest?.type === 'PROCESS_STARTED') {
    console.log('작업 시작 메시지 수신:', latest.message);
    props.detail.input_qtt = latest.input_qtt; // 투입량 업데이트
  }
  else if (latest?.type === 'PROCESS_UPDATE') {
    // 진행률 업데이트
    console.log('진행률 업데이트:', latest.progress);
    props.detail.proc_rate = latest.progress; // 진행률 업데이트
    props.detail.make_qtt = latest.make_qtt; // 생산수량 업데이트
  }
  else {
    console.warn('알 수 없는 메시지 타입:', latest.type);
  }
}, { deep: true });



onUnmounted(() => {
  // 컴포넌트가 언마운트되어도 연결은 유지 (전역)
  // 필요시에만 wsStore.disconnect();
});
</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 gap-4">
      <div class="font-semibold text-2xl">실적 정보</div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="공정명" v-model="props.detail.po_name" :readonly="true" />
      <LabeledInput label="설비명" v-model="props.detail.eq_name" :readonly="true" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="제품명" v-model="props.detail.prod_name" :readonly="true" />
      <LabeledInput label="작업지시코드" v-model="props.detail.wko_code" :readonly="true" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDateTimePicker label="시작시간" v-model="props.detail.start_date" :readonly="true" />
      <LabeledInput label="라인코드" v-model="props.detail.line_code" :readonly="true" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDateTimePicker label="종료시간" v-model="props.detail.end_date" :readonly="true" />
      <!-- <LabeledDateTimePicker label="소요시간" v-model="props.detail.total_time" :readonly="true" /> -->
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="투입량" v-model="props.detail.input_qtt" :readonly="true" />
      <LabeledInput label="지시량" v-model="props.detail.wko_qtt" :readonly="true" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="생산수량" v-model="props.detail.make_qtt" :readonly="true" />
      <LabeledInput label="불량수량" v-model="props.detail.def_qtt" :readonly="true" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="달성률" v-model="props.detail.perform_rate" :readonly="true" />
    </div>

    <div class="flex justify-center gap-3 mt-4">  
      <Button label="뒤로가기" severity="secondary" raised @click="$router.push(`/work/${props.wkoCode}`)" />
      <Button label="작업시작" severity="success"  raised @click="startProcess()" /> 
      <Button label="작업종료" severity="contrast" raised />
    </div>

  </div>
</template>
