// server/noodle-io/broadcaster.js
// 송신 메시지 처리 (Output) - 파이프라인 지원 버전

const { MESSAGE_TYPES } = require('./eventTypes');

class Broadcaster {
  constructor(connectionManager) {
    this.connectionManager = connectionManager;
  }

  // 공정 업데이트 브로드캐스트 (제품별)
  broadcastProcessUpdate(orderId, lineId, processId, status, progress, productId = null) {
    const message = {
      type: MESSAGE_TYPES.OUTPUT.PROCESS_UPDATE,
      orderId,
      lineId,
      processId,
      productId, // 파이프라인에서는 제품 ID 필수
      status,
      progress: Math.round(progress * 100) / 100,
      timestamp: Date.now()
    };
    
    if (productId) {
      console.log(`공정 업데이트: ${productId} @ ${processId} - ${status} (${progress}%)`);
    }
    this.connectionManager.broadcast(message);
  }

  // 작업 시작 알림
  broadcastWorkStarted(orderId, lineId, initiatorClientId) {
    const message = {
      type: MESSAGE_TYPES.OUTPUT.WORK_STARTED,
      orderId,
      lineId,
      initiatedBy: initiatorClientId,
      timestamp: Date.now()
    };
    
    console.log(`파이프라인 시작 브로드캐스트: ${orderId} @ ${lineId} (시작자: ${initiatorClientId})`);
    this.connectionManager.broadcast(message);
  }

  // 작업 완료 알림
  broadcastWorkCompleted(orderId, lineId) {
    const message = {
      type: MESSAGE_TYPES.OUTPUT.WORK_COMPLETED,
      orderId,
      lineId,
      timestamp: Date.now()
    };
    
    console.log(`전체 작업 완료 브로드캐스트: ${orderId} @ ${lineId}`);
    this.connectionManager.broadcast(message);
  }

  // 제품 완료 알림 (새로운 기능)
  broadcastProductCompleted(productId, orderId, lineId, totalTime, processHistory) {
    const message = {
      type: 'PRODUCT_COMPLETED',
      productId,
      orderId,
      lineId,
      totalTime,
      processHistory,
      timestamp: Date.now()
    };
    
    console.log(`제품 완료 브로드캐스트: ${productId} (총 소요시간: ${totalTime}ms)`);
    this.connectionManager.broadcast(message);
  }

  // 공정 스테이션 상태 브로드캐스트 (새로운 기능)
  broadcastStationStatus(processId, capacity, processing, queued, totalProcessed) {
    const message = {
      type: 'STATION_STATUS',
      processId,
      capacity,
      processing,
      queued,
      totalProcessed,
      utilization: (processing / capacity * 100).toFixed(1),
      timestamp: Date.now()
    };
    
    this.connectionManager.broadcast(message);
  }

  // 파이프라인 전체 현황 브로드캐스트 (새로운 기능)
  broadcastPipelineStatus(systemStatus) {
    const message = {
      type: 'PIPELINE_STATUS',
      ...systemStatus,
      timestamp: Date.now()
    };
    
    this.connectionManager.broadcast(message);
  }

  // 제품 이동 알림 (공정 간 이동 시)
  broadcastProductMoved(productId, fromProcessId, toProcessId, orderId, lineId) {
    const message = {
      type: 'PRODUCT_MOVED',
      productId,
      orderId,
      lineId,
      fromProcess: fromProcessId,
      toProcess: toProcessId,
      timestamp: Date.now()
    };
    
    console.log(`제품 이동: ${productId} (${fromProcessId} → ${toProcessId})`);
    this.connectionManager.broadcast(message);
  }

  // 대기 큐 상태 업데이트
  broadcastQueueUpdate(processId, queueLength, processingCount, capacity) {
    const message = {
      type: 'QUEUE_UPDATE',
      processId,
      queueLength,
      processingCount,
      capacity,
      availability: capacity - processingCount,
      timestamp: Date.now()
    };
    
    this.connectionManager.broadcast(message);
  }

  // 작업 중단 알림
  broadcastWorkStopped(orderId, initiatorClientId) {
    const message = {
      type: MESSAGE_TYPES.OUTPUT.WORK_STOPPED,
      orderId,
      stoppedBy: initiatorClientId,
      timestamp: Date.now()
    };
    
    console.log(`작업 중단 브로드캐스트: ${orderId} (중단자: ${initiatorClientId})`);
    this.connectionManager.broadcast(message);
  }

  // 에러 메시지 전송 (특정 클라이언트)
  sendError(clientId, errorMessage) {
    const message = {
      type: MESSAGE_TYPES.OUTPUT.ERROR,
      message: errorMessage,
      timestamp: Date.now()
    };
    
    console.log(`에러 메시지 전송 [${clientId}]: ${errorMessage}`);
    this.connectionManager.sendToClient(clientId, message);
  }

  // 시스템 상태 전송
  sendSystemStatus(clientId) {
    const message = {
      type: MESSAGE_TYPES.OUTPUT.SYSTEM_STATUS,
      connectedClients: this.connectionManager.getConnectedCount(),
      serverTime: Date.now(),
      status: 'RUNNING',
      clientList: this.connectionManager.getClientList()
    };
    
    this.connectionManager.sendToClient(clientId, message);
  }

  // 시스템 상태 브로드캐스트 (모든 클라이언트)
  broadcastSystemStatus() {
    const message = {
      type: MESSAGE_TYPES.OUTPUT.SYSTEM_STATUS,
      connectedClients: this.connectionManager.getConnectedCount(),
      serverTime: Date.now(),
      status: 'RUNNING'
    };
    
    this.connectionManager.broadcast(message);
  }

  // 라인 효율성 브로드캐스트
  broadcastLineEfficiency(lineId, efficiency, throughput, averageTime) {
    const message = {
      type: 'LINE_EFFICIENCY',
      lineId,
      efficiency: Math.round(efficiency * 100) / 100,
      throughput: Math.round(throughput * 100) / 100,
      averageTime: Math.round(averageTime),
      timestamp: Date.now()
    };
    
    this.connectionManager.broadcast(message);
  }

  // 알람/경고 브로드캐스트
  broadcastAlert(level, message, processId = null, productId = null) {
    const alertMessage = {
      type: 'ALERT',
      level, // 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
      message,
      processId,
      productId,
      timestamp: Date.now()
    };
    
    console.log(`알람 브로드캐스트 [${level}]: ${message}`);
    this.connectionManager.broadcast(alertMessage);
  }

  // 커스텀 메시지 브로드캐스트
  broadcastCustom(type, data) {
    const message = {
      type,
      ...data,
      timestamp: Date.now()
    };
    
    this.connectionManager.broadcast(message);
  }

  // 특정 클라이언트에게 커스텀 메시지 전송
  sendCustom(clientId, type, data) {
    const message = {
      type,
      ...data,
      timestamp: Date.now()
    };
    
    this.connectionManager.sendToClient(clientId, message);
  }
}

module.exports = Broadcaster;