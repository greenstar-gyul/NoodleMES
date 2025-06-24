// client/src/services/noodle_client.js
export class NoodleClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.clientId = '';
    
    // 이벤트 콜백들
    this.onConnect = null;
    this.onDisconnect = null;
    this.onMessage = null;
    this.onError = null;
  }

  // 웹소켓 연결
  connect(url = 'ws://localhost:3721') {
    if (this.socket) return false;

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url);
        
        this.socket.onopen = () => {
          this.isConnected = true;
          // console.log('웹소켓 연결 성공!');
          if (this.onConnect) this.onConnect();
          resolve(true);
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // console.log('수신된 data Parsing', data);
            
            // 클라이언트 ID 저장
            if (data.type === 'CONNECTION_SUCCESS' && data.clientId) {
              this.clientId = data.clientId;
            }

            // console.log('디버그1', this.onMessage);
            
            if (this.onMessage) this.onMessage(data);
            // console.log('디버그12');
          } catch (e) {
            if (this.onMessage) this.onMessage({ type: 'RAW', data: event.data });
          }
        };
        
        this.socket.onclose = (event) => {
          this.isConnected = false;
          this.clientId = '';
          this.socket = null;
          // console.log(`🔌 연결 종료 (코드: ${event.code})`);
          if (this.onDisconnect) this.onDisconnect(event);
        };
        
        this.socket.onerror = (error) => {
          // console.error('웹소켓 오류:', error);
          if (this.onError) this.onError(error);
          reject(error);
        };
        
      } catch (error) {
        // console.error('연결 실패:', error);
        alert('웹소켓 연결 실패! 서버가 실행 중인지 확인하세요.');
        if (this.onError) this.onError(error);
        reject(error);
      }
    });
  }

  // 웹소켓 연결 해제
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // 메시지 전송
  send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      // console.error('웹소켓이 연결되지 않았습니다!');
      alert('웹소켓이 연결되지 않았습니다! 서버가 실행 중인지 확인하세요.');
      return false;
    }

    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      this.socket.send(messageStr);
      // console.log('메시지 전송:', message);
      return true;
    } catch (error) {
      // console.error('메시지 전송 실패:', error);
      return false;
    }
  }

  // === 편의 메서드들 ===

  // 5초 Hello 테스트
  startHelloTest() {
    if (!this.isConnected) {
      // console.error('연결되지 않음!');
      alert('웹소켓이 연결되지 않았습니다! 서버가 실행 중인지 확인하세요.');
      return false;
    }

    let count = 0;
    const maxCount = 5;

    const testInterval = setInterval(() => {
      count++;
      
      this.send({
        type: 'TEST_HELLO',
        message: 'Hello',
        count: count,
        timestamp: Date.now()
      });

      if (count >= maxCount) {
        clearInterval(testInterval);
        // console.log('Hello 테스트 완료!');
      }
    }, 1000);

    return testInterval;
  }

  // 시스템 상태 요청
  requestStatus() {
    return this.send({
      type: 'CLIENT_CONNECT',
      timestamp: Date.now()
    });
  }

  // 테스트 메시지
  sendTestMessage() {
    return this.send({
      type: 'TEST',
      message: 'Hello WebSocket!',
      timestamp: Date.now()
    });
  }

  // 커스텀 메시지
  sendCustomMessage(type, data = {}) {
    return this.send({
      type,
      ...data,
      timestamp: Date.now()
    });
  }

  // === 상태 조회 ===

  // 연결 상태 확인
  getConnectionStatus() {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'disconnecting';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  // 클라이언트 정보
  getClientInfo() {
    return {
      clientId: this.clientId,
      isConnected: this.isConnected,
      status: this.getConnectionStatus()
    };
  }
}

// 싱글톤 인스턴스 (선택사항)
export const noodleClient = new NoodleClient();

// 기본 export
export default NoodleClient;