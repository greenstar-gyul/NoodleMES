<script setup>
import { ref, defineProps, onUnmounted, onMounted } from 'vue';
import Button from 'primevue/button';
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledDateTimePicker from '@/components/registration-bar/LabeledDateTimePicker.vue';

// 웹소켓
import { NoodleClient } from '../../../service/noodle_client';
import { sassNull } from 'sass';


const props = defineProps({
  detail: {
    type: Object,
    required: true
  }
});


// 클라이언트 인스턴스 생성
const client = new NoodleClient();
// const HOST = 'localhost';
const HOST = '192.168.0.25';
const PORT = '3721';
const server = `ws://${HOST}:${PORT}`;
const connectionStatus = ref('disconnected');
const clientId = ref('');


//연결 상태 텍스트
const getStatusText = () => {
  const statusMap = {
    disconnected: '연결 안됨',
    connecting: '연결중 ...',
    connected: '연결됨' 
  }
  return StatusMap[connectionStatus.value] || '알수없음';
};

// NoodleClient 이벤트 핸들러 설정
client.onConnect = () => {
  connectionStatus.value = 'connected';
  console.log('system', '✅ 웹소켓 연결 성공!');
};

client.onDisconnect = (event) => {
  connectionStatus.value = 'disconnected';
  clientId.value = '';
  stopConnectionTimer();
  console.log('system', `❌ 연결 종료 (코드: ${event.code})`);
};

client.onMessage = (data) => {

  // console.log('onMessage 콜백 함수 data', data);

  // 클라이언트 ID 업데이트
  if (data.type === 'CONNECTION_SUCCESS' && data.clientId) {
    clientId.value = data.clientId;
  }

  // console.log('콜백함수1');
  
  // 메시지 로그 추가
  if (data.type === 'RAW') {
    console.log('received', `Raw: ${data.data}`);
  } 
  else if (data.type === 'PROCESS_STARTED') {
    console.log(data);
  }
  else {
    console.log('received', `${data.type}: ${JSON.stringify(data)}`);
  }
  // console.log('콜백함수2');

};

client.onError = (error) => {
  connectionStatus.value = 'disconnected';
  console.log('error', `🚨 연결 오류: ${error}`);
};

// 웹소켓 연결
const connect = async () => {
  connectionStatus.value = 'connecting';
  console.log('system', '웹소켓 서버에 연결 시도...');

  try {
    await client.connect(server);
  } catch (error) {
    connectionStatus.value = 'disconnected';
    console.log('error', `🚨 연결 실패: ${error.message}`);
  }
};

// 웹소켓 연결 해제
const disconnect = () => {
  client.disconnect();
};

// 작업시작 버튼
const startProcess = async () => {
  client.send({
      type: 'START_PROCESS',
      message: datas.value,
      timestamp: Date.now()
    });
  console.log('sent', `Hello 메시지 전송`);
}

const datas = ref({prdr_code:''});

onMounted(() => {
  connect();
});



// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  disconnect();
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
      <LabeledInput label="라인코드" v-model="props.detail.line_code" :readonly="true" />
      <LabeledDateTimePicker label="시작시간" v-model="props.detail.start_date" :readonly="true" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDateTimePicker label="종료시간" v-model="props.detail.end_date" :readonly="true" />
      <LabeledDateTimePicker label="소요시간" v-model="props.detail.total_time" :readonly="true" />
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
      <Button label="뒤로가기" severity="secondary" raised />
      <Button label="작업시작" severity="success"  raised @click="startProcess()" /> 
      <Button label="작업종료" severity="contrast" raised />
    </div>

  </div>
</template>
