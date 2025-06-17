// server/noodle-io/socketServer.js
// WebSocket 서버 생성 및 기본 설정

const WebSocket = require('ws');
const ConnectionManager = require('./connectionManager');
const MessageHandler = require('./messageHandler');

class SocketServer {
  constructor() {
    this.wss = null;
    this.connectionManager = new ConnectionManager();
    this.messageHandler = new MessageHandler(this.connectionManager);
  }

  create(httpServer) {
    this.wss = new WebSocket.Server({ server: httpServer });
    
    this.wss.on('connection', (ws, req) => {
      console.log('새로운 클라이언트 연결');
      
      // 클라이언트 등록
      const clientId = this.connectionManager.addClient(ws);
      ws.clientId = clientId;
      
      // 메시지 수신 처리
      ws.on('message', (message) => {
        this.messageHandler.handle(clientId, message);
      });
      
      // 연결 해제 처리
      ws.on('close', () => {
        console.log(`클라이언트 ${clientId} 연결 해제`);
        this.connectionManager.removeClient(clientId);
      });
      
      // 에러 처리
      ws.on('error', (error) => {
        console.error(`클라이언트 ${clientId} 에러:`, error);
        this.connectionManager.removeClient(clientId);
      });

      // 연결 확인 메시지 전송
      this.connectionManager.sendToClient(clientId, {
        type: 'CONNECTION_SUCCESS',
        clientId: clientId,
        message: '서버에 연결되었습니다.'
      });
    });
    
    console.log('WebSocket 시작');
    return this.wss;
  }

  getConnectionManager() {
    return this.connectionManager;
  }

  getMessageHandler() {
    return this.messageHandler;
  }

  // 서버 종료 시 정리
  close() {
    if (this.messageHandler && this.messageHandler.processSimulator) {
      this.messageHandler.processSimulator.stopAllProcesses();
    }
    
    if (this.wss) {
      this.wss.close();
    }
    console.log('WebSocket 종료');
  }
}

module.exports = SocketServer;