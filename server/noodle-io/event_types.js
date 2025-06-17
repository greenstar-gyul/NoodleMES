// server/noodle-io/event_types.js
// 메시지 타입 및 스키마 정의

const MESSAGE_TYPES = {
  // Input (Client → Server)
  INPUT: {
    START_WORK: 'START_WORK',
    STOP_WORK: 'STOP_WORK',
    PAUSE_WORK: 'PAUSE_WORK',
    RESUME_WORK: 'RESUME_WORK',
    CLIENT_CONNECT: 'CLIENT_CONNECT'
  },
  
  // Output (Server → Client)
  OUTPUT: {
    PROCESS_UPDATE: 'PROCESS_UPDATE',
    WORK_STARTED: 'WORK_STARTED',
    WORK_COMPLETED: 'WORK_COMPLETED',
    WORK_STOPPED: 'WORK_STOPPED',
    ERROR: 'ERROR',
    SYSTEM_STATUS: 'SYSTEM_STATUS'
  }
};

const PROCESS_STATUS = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
  PAUSED: 'PAUSED'
};

const MESSAGE_SCHEMAS = {
  // Input 메시지 스키마
  START_WORK: {
    type: 'START_WORK',
    orderId: 'string',      // 주문 ID
    lineId: 'string',       // 라인 ID
    processFlow: 'array'    // 공정 순서 배열
  },
  
  STOP_WORK: {
    type: 'STOP_WORK',
    orderId: 'string'
  },
  
  // Output 메시지 스키마
  PROCESS_UPDATE: {
    type: 'PROCESS_UPDATE',
    orderId: 'string',
    lineId: 'string',
    processId: 'string',
    status: 'string',       // PROCESS_STATUS 중 하나
    progress: 'number',     // 0-100
    timestamp: 'number'
  },
  
  WORK_STARTED: {
    type: 'WORK_STARTED',
    orderId: 'string',
    lineId: 'string',
    initiatedBy: 'string',  // 시작한 클라이언트 ID
    timestamp: 'number'
  }
};

module.exports = { 
  MESSAGE_TYPES, 
  PROCESS_STATUS, 
  MESSAGE_SCHEMAS 
};