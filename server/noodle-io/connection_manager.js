// server/noodle-io/connectionManager.js
// 클라이언트 연결 관리

const WebSocket = require('ws');

class ConnectionManager {
  constructor() {
    this.clients = new Map(); // clientId -> { ws, info }
    this.clientCounter = 0;
  }

  addClient(ws) {
    const clientId = `client_${++this.clientCounter}`;
    const clientInfo = {
      ws: ws,
      info: {
        connectedAt: new Date(),
        lastActivity: new Date(),
        userAgent: ws.upgradeReq?.headers['user-agent'] || 'Unknown'
      }
    };
    
    this.clients.set(clientId, clientInfo);
    console.log(`클라이언트 등록: ${clientId}, 총 ${this.clients.size}명 연결`);
    return clientId;
  }

  removeClient(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      console.log(`클라이언트 제거: ${clientId}, 총 ${this.clients.size}명 연결`);
    }
  }

  getClient(clientId) {
    const client = this.clients.get(clientId);
    return client ? client.ws : null;
  }

  getAllClients() {
    return Array.from(this.clients.values()).map(client => client.ws);
  }

  getConnectedCount() {
    return this.clients.size;
  }

  // 클라이언트 정보 업데이트
  updateClientActivity(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      client.info.lastActivity = new Date();
    }
  }

  // 특정 클라이언트에게 메시지 전송
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
        this.updateClientActivity(clientId);
        return true;
      } catch (error) {
        console.error(`클라이언트 ${clientId} 전송 실패:`, error);
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
    
    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(messageStr);
          this.updateClientActivity(clientId);
          sentCount++;
        } catch (error) {
          console.error(`브로드캐스트 실패 ${clientId}:`, error);
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
    
    console.log(`브로드캐스트: ${sentCount}명에게 전송 완료`);
    return sentCount;
  }

  // 특정 조건의 클라이언트들에게만 전송
  broadcastToFilter(message, filterFn) {
    const messageStr = JSON.stringify(message);
    let sentCount = 0;
    
    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN && filterFn(clientId, client)) {
        try {
          client.ws.send(messageStr);
          this.updateClientActivity(clientId);
          sentCount++;
        } catch (error) {
          console.error(`필터 브로드캐스트 실패 ${clientId}:`, error);
        }
      }
    });
    
    return sentCount;
  }

  // 연결된 클라이언트 목록 조회
  getClientList() {
    const clientList = [];
    this.clients.forEach((client, clientId) => {
      clientList.push({
        clientId: clientId,
        connectedAt: client.info.connectedAt,
        lastActivity: client.info.lastActivity,
        status: client.ws.readyState === WebSocket.OPEN ? 'CONNECTED' : 'DISCONNECTED'
      });
    });
    return clientList;
  }
}

module.exports = ConnectionManager;