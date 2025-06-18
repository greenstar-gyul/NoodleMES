<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { NoodleClient } from '@/service/noodle_client.js'; // 경로는 실제 위치에 맞게 조정

// NoodleClient 인스턴스 생성
const client = new NoodleClient();

// 반응형 데이터
const connectionStatus = ref('disconnected');
const clientId = ref('');
const messageCount = ref(0);
const testProgress = ref('');
const connectionTime = ref('00:00');
const logs = ref([]);
const isTestRunning = ref(false);

// 타이머들
const connectionTimer = ref(null);
const connectionStartTime = ref(null);

// 템플릿 참조
const logContainer = ref(null);

// 계산된 속성들
const isConnected = ref(false);

// 연결 상태 텍스트
const getStatusText = () => {
  const statusMap = {
    disconnected: '연결 안됨',
    connecting: '연결 중...',
    connected: '연결됨'
  };
  return statusMap[connectionStatus.value] || '알 수 없음';
};

// 로그 추가 함수
const addLog = (type, message) => {
  const now = new Date();
  const time = now.toLocaleTimeString();

  logs.value.push({
    type,
    message,
    time,
    timestamp: now.getTime()
  });

  // 로그가 너무 많으면 오래된 것 삭제
  if (logs.value.length > 100) {
    logs.value.shift();
  }

  // 스크롤을 맨 아래로
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
};

// NoodleClient 이벤트 핸들러 설정
client.onConnect = () => {
  connectionStatus.value = 'connected';
  isConnected.value = true;
  connectionStartTime.value = Date.now();
  startConnectionTimer();
  addLog('system', '✅ 웹소켓 연결 성공!');
};

client.onDisconnect = (event) => {
  connectionStatus.value = 'disconnected';
  isConnected.value = false;
  isTestRunning.value = false;
  clientId.value = '';
  stopConnectionTimer();
  addLog('system', `❌ 연결 종료 (코드: ${event.code})`);
};

client.onMessage = (data) => {
  messageCount.value++;

  // 클라이언트 ID 업데이트
  if (data.type === 'CONNECTION_SUCCESS' && data.clientId) {
    clientId.value = data.clientId;
  }

  // 메시지 로그 추가
  if (data.type === 'RAW') {
    addLog('received', `Raw: ${data.data}`);
  } else {
    addLog('received', `${data.type}: ${JSON.stringify(data)}`);
  }
};

client.onError = (error) => {
  connectionStatus.value = 'disconnected';
  isConnected.value = false;
  addLog('error', `🚨 연결 오류: ${error}`);
};

// 웹소켓 연결
const connect = async () => {
  connectionStatus.value = 'connecting';
  addLog('system', '웹소켓 서버에 연결 시도...');

  try {
    await client.connect('ws://localhost:3721');
  } catch (error) {
    connectionStatus.value = 'disconnected';
    addLog('error', `🚨 연결 실패: ${error.message}`);
  }
};

// 웹소켓 연결 해제
const disconnect = () => {
  client.disconnect();
};

// 5초 Hello 테스트
const startHelloTest = () => {
  if (!isConnected.value || isTestRunning.value) return;

  isTestRunning.value = true;
  testProgress.value = '시작...';
  addLog('system', '🚀 5초 테스트 시작 (1초 간격으로 Hello 메시지)');

  let count = 0;
  const maxCount = 5;

  const testInterval = setInterval(() => {
    count++;
    testProgress.value = `${count}/${maxCount}`;

    // Hello 메시지 전송
    client.send({
      type: 'TEST_HELLO',
      message: 'Hello',
      count: count,
      timestamp: Date.now()
    });

    addLog('sent', `Hello 메시지 #${count} 전송`);

    if (count >= maxCount) {
      clearInterval(testInterval);
      isTestRunning.value = false;
      testProgress.value = '완료!';
      addLog('system', '✅ 5초 테스트 완료!');
    }
  }, 1000);
};

// 로그 지우기
const clearLog = () => {
  logs.value = [];
  messageCount.value = 0;
};

// 연결 시간 타이머
const startConnectionTimer = () => {
  connectionTimer.value = setInterval(() => {
    if (connectionStartTime.value) {
      const elapsed = Math.floor((Date.now() - connectionStartTime.value) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      connectionTime.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }, 1000);
};

const stopConnectionTimer = () => {
  if (connectionTimer.value) {
    clearInterval(connectionTimer.value);
    connectionTimer.value = null;
  }
  connectionTime.value = '00:00';
};

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  client.disconnect();
  stopConnectionTimer();
});
</script>

<style scoped>
.websocket-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.status-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-indicator {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
}

.status-dot.connected {
  background: #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
}

.status-dot.connecting {
  background: #ffc107;
  animation: pulse 1.5s infinite;
}

.status-dot.disconnected {
  background: #dc3545;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

.client-info {
  color: #666;
  font-size: 14px;
}

.control-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  background: #6c757d;
  color: white;
}

.btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}

.log-section {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.log-header {
  background: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.log-container {
  height: 300px;
  overflow-y: auto;
  background: #1e1e1e;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.log-item {
  padding: 8px 15px;
  border-bottom: 1px solid #333;
  line-height: 1.4;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #888;
  margin-right: 10px;
}

.log-type {
  margin-right: 10px;
  font-weight: bold;
}

.log-item.system .log-type {
  color: #FF9800;
}

.log-item.sent .log-type {
  color: #4CAF50;
}

.log-item.received .log-type {
  color: #2196F3;
}

.log-item.error .log-type {
  color: #F44336;
}

.log-message {
  color: #ffffff;
}
</style>

<template>
  <div class="websocket-test">
    <div class="card">
      <h2>🔌 웹소켓 테스트</h2>

      <!-- 연결 상태 -->
      <div class="status-section">
        <div class="status-indicator">
          <span class="status-dot" :class="connectionStatus"></span>
          연결 상태: {{ getStatusText() }}
        </div>
        <div class="client-info" v-if="clientId">
          클라이언트 ID: <strong>{{ clientId }}</strong>
        </div>
      </div>

      <!-- 제어 버튼 -->
      <div class="control-section">
        <button @click="connect" :disabled="isConnected" class="btn btn-primary">
          연결
        </button>
        <button @click="disconnect" :disabled="!isConnected" class="btn btn-danger">
          연결 해제
        </button>
        <button @click="startHelloTest" :disabled="!isConnected || isTestRunning" class="btn btn-success">
          5초 테스트 시작
        </button>
        <button @click="client.requestStatus()" :disabled="!isConnected" class="btn btn-primary">상태 요청</button>
        <button @click="client.sendTestMessage()" :disabled="!isConnected" class="btn btn-primary">테스트 메시지</button>
      </div>

      <!-- 통계 정보 -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-value">{{ messageCount }}</div>
          <div class="stat-label">받은 메시지</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ testProgress }}</div>
          <div class="stat-label">테스트 진행</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ connectionTime }}</div>
          <div class="stat-label">연결 시간</div>
        </div>
      </div>

      <!-- 메시지 로그 -->
      <div class="log-section">
        <div class="log-header">
          <h3>메시지 로그</h3>
          <button @click="clearLog" class="btn btn-small">지우기</button>
        </div>
        <div class="log-container" ref="logContainer">
          <div v-for="(log, index) in logs" :key="index" class="log-item" :class="log.type">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-type">[{{ log.type.toUpperCase() }}]</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>