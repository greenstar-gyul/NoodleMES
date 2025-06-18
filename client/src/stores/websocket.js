import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { NoodleClient } from '@/service/noodle_client.js';

export const useWebSocketStore = defineStore('websocket', () => {
  // State
  const client = new NoodleClient();
  const isConnected = ref(false);
  const clientId = ref('');
  const connectionStatus = ref('disconnected');
  const messages = ref([]);
  
  // 서버 설정
  const HOST = '192.168.0.25';
  const PORT = '3721';
  const server = `ws://${HOST}:${PORT}`;
  
  // Getters
  const getStatusText = computed(() => {
    const statusMap = {
      disconnected: '연결 안됨',
      connecting: '연결중 ...',
      connected: '연결됨'
    };
    return statusMap[connectionStatus.value] || '알수없음';
  });
  
  // Actions
  const setupEventHandlers = () => {
    client.onConnect = () => {
      connectionStatus.value = 'connected';
      isConnected.value = true;
      console.log('✅ 웹소켓 연결 성공!');
    };

    client.onDisconnect = (event) => {
      connectionStatus.value = 'disconnected';
      isConnected.value = false;
      clientId.value = '';
      console.log(`❌ 연결 종료 (코드: ${event.code})`);
    };

    client.onMessage = (data) => {
      // 메시지 저장
      messages.value.push({
        ...data,
        timestamp: Date.now()
      });

      // 클라이언트 ID 업데이트
      if (data.type === 'CONNECTION_SUCCESS' && data.clientId) {
        clientId.value = data.clientId;
      }

      // 메시지 타입별 처리
      if (data.type === 'RAW') {
        console.log('received', `Raw: ${data.data}`);
      } else if (data.type === 'PROCESS_STARTED') {
        console.log('공정 시작:', data);
      } else {
        console.log('received', `${data.type}: ${JSON.stringify(data)}`);
      }
    };

    client.onError = (error) => {
      connectionStatus.value = 'disconnected';
      isConnected.value = false;
      console.log('🚨 연결 오류:', error);
    };
  };
  
  const connect = async () => {
    connectionStatus.value = 'connecting';
    console.log('웹소켓 서버에 연결 시도...');
    
    setupEventHandlers();
    
    try {
      await client.connect(server);
    } catch (error) {
      connectionStatus.value = 'disconnected';
      isConnected.value = false;
      console.log('🚨 연결 실패:', error.message);
    }
  };
  
  const disconnect = () => {
    client.disconnect();
  };
  
  const startProcess = (data) => {
    return client.send({
      type: 'START_PROCESS',
      message: data,
      timestamp: Date.now()
    });
  };
  
  const sendMessage = (message) => {
    return client.send(message);
  };
  
  return {
    // State
    isConnected,
    clientId,
    connectionStatus,
    messages,
    
    // Getters
    getStatusText,
    
    // Actions
    connect,
    disconnect,
    startProcess,
    sendMessage
  };
});