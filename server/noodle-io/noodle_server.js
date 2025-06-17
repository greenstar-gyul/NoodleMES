// noodle_server.js - 웹소켓 전용 서버
const WebSocket = require('ws');
const mariadb = require("../database/mapper.js");

class NoodleServer {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.clientCounter = 0;
  }

  // 웹소켓 서버 생성 (HTTP 서버와 연결)
  create(httpServer) {
    this.wss = new WebSocket.Server({ server: httpServer });
    
    console.log('🔌 웹소켓 서버 시작');
    
    this.wss.on('connection', (ws, req) => {
      const clientId = this.addClient(ws);
      
      // 연결 성공 메시지 전송
      this.sendToClient(clientId, {
        type: 'CONNECTION_SUCCESS',
        clientId: clientId,
        message: '서버에 연결되었습니다.'
      });
      
      // 메시지 수신 처리
      ws.on('message', (message) => {
        this.recvMessage(clientId, message);
      });
      
      // 연결 해제 처리
      ws.on('close', () => {
        this.removeClient(clientId);
      });
      
      // 에러 처리
      ws.on('error', (error) => {
        console.error(`❌ [${clientId}] 웹소켓 오류:`, error);
        this.removeClient(clientId);
      });
    });
    
    return this.wss;
  }

  // 클라이언트 추가
  addClient(ws) {
    const clientId = `client_${++this.clientCounter}`;
    this.clients.set(clientId, ws);
    console.log(`🔌 새로운 클라이언트 연결: ${clientId} (총 ${this.clients.size}명)`);
    return clientId;
  }

  // 클라이언트 제거
  removeClient(clientId) {
    if (this.clients.has(clientId)) {
      this.clients.delete(clientId);
      console.log(`🔌 클라이언트 연결 해제: ${clientId} (총 ${this.clients.size}명)`);
    }
  }

  // 메시지 수신 처리
  recvMessage(clientId, message) {
    try {
      const data = JSON.parse(message);
      console.log(`📩 [${clientId}] 메시지 수신:`, data);
      
      // 메시지 타입별 처리
      switch(data.type) {
        case 'TEST_HELLO':
          // Hello 메시지에 대한 응답
          this.sendToClient(clientId, {
            type: 'HELLO_RESPONSE',
            message: `Hello Response #${data.count}`,
            originalMessage: data.message,
            timestamp: Date.now()
          });
          break;
          
        default:
          // 기본 에코 메시지
          this.sendToClient(clientId, {
            type: 'ECHO',
            originalMessage: data,
            timestamp: Date.now()
          });
      }
      
    } 
    catch (error) {
      console.error(`❌ [${clientId}] 메시지 파싱 오류:`, error);
      this.sendToClient(clientId, {
        type: 'ERROR',
        message: '메시지 형식이 올바르지 않습니다.',
        timestamp: Date.now()
      });
    }
  }

  // 특정 클라이언트에게 메시지 전송
  sendToClient(clientId, message) {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`❌ [${clientId}] 메시지 전송 실패:`, error);
        this.removeClient(clientId);
        return false;
      }
    }
    return false;
  }

  // 모든 클라이언트에게 브로드캐스트
  broadcast(message) {
    const messageStr = JSON.stringify(message);
    let sentCount = 0;
    let failedClients = [];
    
    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error(`❌ 브로드캐스트 실패 [${clientId}]:`, error);
          failedClients.push(clientId);
        }
      } else {
        failedClients.push(clientId);
      }
    });
    
    // 실패한 클라이언트들 정리
    failedClients.forEach(clientId => {
      this.removeClient(clientId);
    });
    
    console.log(`📡 브로드캐스트: ${sentCount}명에게 전송 완료`);
    return sentCount;
  }

  // 1. 작업 진행 상세 테이블에 저장하기. 있다면 불러오기.
  startProcess(prdrCode) {
    
    
    const prdrDetail = { };


    if (prdrCode == null || prdrCode === '') {

    }
  }

//   async insertPrdr(data) {
//     const conn = await mariadb.connectionPool.getConnection();

//     // 트랜잭션 내에서 실행
//     try {
//         await conn.beginTransaction(); // 트랜잭션 BEGIN
        
//         // PRDR 코드 새로 생성해 가져오기
//         const prdrCodeRes = await mariadb.queryConn(conn, 'selectPRDRCodeForUpdate');
//         const prdrCode = prdrCodeRes[0].prdr_code;

//         // PRDR 코드 저장
//         const prdrData = [ prdrCode, data.note, data.wko_qtt, data.wko_code, data.emp_code, data.prod_code ];
//         const result = await mariadb.queryConn(conn, 'insertPRDR', prdrData);

//         // const 
//     }
//   }


  // 2. 타이머가 작동 되면서 작업 수량이 올라가면서 진행도와 달성률이 올라가야함.

  // 연결된 클라이언트 수 조회
  getConnectedCount() {
    return this.clients.size;
  }

  // 클라이언트 목록 조회
  getClientList() {
    return Array.from(this.clients.keys());
  }

  // 웹소켓 서버 상태 정보
  getStatus() {
    return {
      connectedClients: this.clients.size,
      clientIds: this.getClientList(),
      serverTime: new Date().toISOString()
    };
  }

  // 서버 종료
  close() {
    if (this.wss) {
      console.log('🔌 웹소켓 서버 종료 중...');
      this.wss.close(() => {
        console.log('✅ 웹소켓 서버 종료 완료');
      });
    }
  }
}

module.exports = NoodleServer;