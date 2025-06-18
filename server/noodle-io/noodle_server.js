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
  async recvMessage(clientId, message) {
    try {
      const recv = JSON.parse(message);
      console.log(`📩 [${clientId}] 메시지 수신:`, recv);
      
      // 메시지 타입별 처리
      switch(recv.type) {
        case 'TEST_HELLO':
          // Hello 메시지에 대한 응답
          this.sendToClient(clientId, {
            type: 'HELLO_RESPONSE',
            message: `Hello Response from server!`,
            originalMessage: recv.message,
            timestamp: Date.now()
          });
          break;

        case 'START_PROCESS':
          // 작업 시작 요청 처리
          const data = recv.message;
          await this.startProcess(data);
          this.sendToClient(clientId, {
              type: 'PROCESS_STARTED',
              message: `작업이 시작되었습니다: ${data.prdr_code}`,
              data: data,
              timestamp: Date.now()
          });
          console.log(data.prdr_code, '작업 시작 요청 처리 완료', data);
          break;
          
        default:
          // 기본 에코 메시지
          this.sendToClient(clientId, {
            type: 'ECHO',
            originalMessage: recv,
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
  async startProcess(data) {
    
    const prdrDetail = { };

    // PRDR 코드가 없다면 신규 등록
    if (data.prdr_code == null || data.prdr_code === '') {
      await this.insertPrdr(data);
      console.log(`✅ PRDR 코드 ${data.prdr_code} 저장 완료`);
    }
    // PRDR 코드가 있다면 작업 재개
    else {
      // PRDR 코드가 이미 존재하는 경우
      prdrDetail.prdr_code = data.prdr_code;
      prdrDetail.note = data.note;
      prdrDetail.wkoQtt = data.wkoQtt;
      prdrDetail.wkoCode = data.wkoCode;
      prdrDetail.empCode = data.empCode;
      prdrDetail.prodCode = data.prodCode;

      console.log(`✅ PRDR 코드 ${data.prdr_code} 이미 존재, 업데이트 필요`);
    }
  }

  // 1-1. PRDR 코드가 없으면 새로 생성하고 저장
  async insertPrdr(data) {
    const conn = await mariadb.connectionPool.getConnection();

    // 트랜잭션 내에서 실행
    try {
        await conn.beginTransaction(); // 트랜잭션 BEGIN
        
        // PRDR 코드 새로 생성해 가져오기
        const prdrCodeRes = await mariadb.queryConn(conn, 'selectPRDRCodeForUpdate');
        const prdrCode = prdrCodeRes[0].prdr_code;

        // PRDR 코드 저장
        const prdrData = [ 
          prdrCode, 
          data.note ?? null, 
          data.wko_qtt ?? 0, 
          data.wko_code ?? 'WKO-20250605-001', 
          data.emp_code ?? 'EMP-10001', 
          data.prod_code ?? 'PROD-1001' 
        ];
        const result = await mariadb.queryConn(conn, 'insertPRDR', prdrData);

        if (result.affectedRows > 0) {
          console.log(`✅ PRDR 코드 ${prdrCode} 저장 성공`);
        }
        else {
          console.error(`❌ PRDR 코드 ${prdrCode} 저장 실패`);
          throw new Error(`PRDR 코드 ${prdrCode} 저장 실패`);
        }

        const lineEQCodeList = await mariadb.queryConn(conn, 'selectLineDetailList', [data.wko_code ?? 'WKO-20250605-001']);
        console.log('라인 공정 코드 목록:', lineEQCodeList);
        // const prdrDCodeList = [];

        for (const lineEqCode of lineEQCodeList) {
          const prdrDCodeRes = await mariadb.queryConn(conn, 'selectPRDRDCode');
          const prdrDCode = prdrDCodeRes[0].prdr_d_code;
          // prdrDCodeList.push(prdrDCode);
          
          const prdrDData = [ prdrDCode, prdrCode, lineEqCode.line_eq_code ];
          const prdrDRes = await mariadb.queryConn(conn, 'insertPRDRD', prdrDData);
          
          if (prdrDRes.affectedRows > 0) {
            console.log(`✅ PRDR-D 코드 ${prdrDCode} 저장 성공`);
          }
          else {
            console.error(`❌ PRDR-D 코드 ${prdrDCode} 저장 실패`);
            throw new Error(`PRDR-D 코드 ${prdrDCode} 저장 실패`);
          }
        }
        
        const prdrDCodeRes = await mariadb.queryConn(conn, 'selectPrdrDCodeForDetail', [ data.wko_code ?? 'WKO-20250606-001', data.eq_code ?? 'EQ-MIX-0001']);
        const prdrDCode = prdrDCodeRes[0].prdr_d_code;
        console.log('PRDR-D 코드 조회 결과:', prdrDCode);

        // await conn.commit(); // 트랜잭션 커밋
        console.log('✅ PRDR 저장 트랜잭션 성공:', prdrCode, prdrDCode);

        data.prdr_code = prdrCode;
        data.prdr_d_code = prdrDCode;

        await conn.rollback(); // 트랜잭션 커밋은 하지 않고 롤백 (테스트용)

        return { prdrCode, prdrDCode, result };
    }
    catch (err) {
      await conn.rollback(); // 트랜잭션 실패 시 롤백
      console.error('❌ PRDR 저장 트랜잭션 실패:', err);
      throw err;
    }
    finally {
      conn.release(); // 컨넥션 풀 반납
    }
  }


  // 2. 타이머가 작동 되면서 작업 수량이 올라가면서 진행도와 달성률이 올라가야함.
  // 2-1. 작업 진행을 위해 prdr_d 코드를 불러와서 

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