// server/noodle-io/messageHandler.js
// 수신 메시지 처리 (Input)

const { MESSAGE_TYPES } = require('./eventTypes');
const ProcessSimulator = require('./processSimulator');
const Broadcaster = require('./broadcaster');

class MessageHandler {
  constructor(connectionManager) {
    this.connectionManager = connectionManager;
    this.broadcaster = new Broadcaster(connectionManager);
    this.processSimulator = new ProcessSimulator(connectionManager, this.broadcaster);
  }

  handle(clientId, rawMessage) {
    try {
      // 클라이언트 활동 시간 업데이트
      this.connectionManager.updateClientActivity(clientId);
      
      const message = JSON.parse(rawMessage);
      console.log(`[${clientId}] 메시지 수신:`, message.type);

      // 메시지 타입별 처리
      switch (message.type) {
        case MESSAGE_TYPES.INPUT.START_WORK:
          this.handleStartWork(clientId, message);
          break;
          
        case MESSAGE_TYPES.INPUT.STOP_WORK:
          this.handleStopWork(clientId, message);
          break;
          
        case MESSAGE_TYPES.INPUT.PAUSE_WORK:
          this.handlePauseWork(clientId, message);
          break;
          
        case MESSAGE_TYPES.INPUT.RESUME_WORK:
          this.handleResumeWork(clientId, message);
          break;
          
        case MESSAGE_TYPES.INPUT.CLIENT_CONNECT:
          this.handleClientConnect(clientId, message);
          break;
          
        default:
          console.warn(`[${clientId}] 알 수 없는 메시지 타입: ${message.type}`);
          this.broadcaster.sendError(clientId, `알 수 없는 메시지 타입: ${message.type}`);
      }
    } catch (error) {
      console.error(`[${clientId}] 메시지 파싱 에러:`, error);
      this.broadcaster.sendError(clientId, '메시지 형식 오류');
    }
  }

  handleStartWork(clientId, message) {
    const { orderId, lineId, processFlow } = message;
    
    // 입력 검증
    if (!orderId || !lineId || !Array.isArray(processFlow) || processFlow.length === 0) {
      this.broadcaster.sendError(clientId, '필수 파라미터 누락 (orderId, lineId, processFlow 필요)');
      return;
    }

    // 이미 실행 중인 작업 확인
    if (this.processSimulator.isProcessRunning(orderId)) {
      this.broadcaster.sendError(clientId, `주문 ${orderId}는 이미 실행 중입니다.`);
      return;
    }

    console.log(`[${clientId}] 작업 시작 요청: ${orderId} @ ${lineId}`);
    
    // 작업 시작 알림 (모든 클라이언트에게)
    this.broadcaster.broadcastWorkStarted(orderId, lineId, clientId);
    
    // 공정 시뮬레이션 시작
    this.processSimulator.startProcess(orderId, lineId, processFlow);
  }

  handleStopWork(clientId, message) {
    const { orderId } = message;
    
    if (!orderId) {
      this.broadcaster.sendError(clientId, 'orderId가 필요합니다.');
      return;
    }

    if (!this.processSimulator.isProcessRunning(orderId)) {
      this.broadcaster.sendError(clientId, `주문 ${orderId}는 실행 중이 아닙니다.`);
      return;
    }

    console.log(`[${clientId}] 작업 중단 요청: ${orderId}`);
    
    // 공정 중단
    this.processSimulator.stopProcess(orderId);
    
    // 작업 중단 알림
    this.broadcaster.broadcastWorkStopped(orderId, clientId);
  }

  handlePauseWork(clientId, message) {
    const { orderId } = message;
    
    if (!orderId) {
      this.broadcaster.sendError(clientId, 'orderId가 필요합니다.');
      return;
    }

    console.log(`[${clientId}] 작업 일시정지 요청: ${orderId}`);
    
    // 일시정지 로직 (추후 구현)
    this.broadcaster.sendError(clientId, '일시정지 기능은 아직 구현되지 않았습니다.');
  }

  handleResumeWork(clientId, message) {
    const { orderId } = message;
    
    if (!orderId) {
      this.broadcaster.sendError(clientId, 'orderId가 필요합니다.');
      return;
    }

    console.log(`[${clientId}] 작업 재개 요청: ${orderId}`);
    
    // 재개 로직 (추후 구현)
    this.broadcaster.sendError(clientId, '재개 기능은 아직 구현되지 않았습니다.');
  }

  handleClientConnect(clientId, message) {
    const { userInfo } = message;
    
    console.log(`[${clientId}] 클라이언트 연결 정보:`, userInfo);
    
    // 현재 시스템 상태 전송
    this.broadcaster.sendSystemStatus(clientId);
    
    // 현재 실행 중인 작업 목록 전송
    const runningProcesses = this.processSimulator.getRunningProcesses();
    if (runningProcesses.length > 0) {
      this.connectionManager.sendToClient(clientId, {
        type: 'RUNNING_PROCESSES',
        processes: runningProcesses
      });
    }
  }

  // ProcessSimulator 참조 반환 (외부에서 접근 필요시)
  getProcessSimulator() {
    return this.processSimulator;
  }
}

module.exports = MessageHandler;