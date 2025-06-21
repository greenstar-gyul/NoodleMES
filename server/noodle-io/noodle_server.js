// noodle_server.js - 웹소켓 전용 서버
const WebSocket = require('ws');
const mariadb = require("../database/mapper.js");

const unitMapper = {
  'kg': 'h1',
  'L': 'h3',
  'ea': 'h4',
  'box': 'h5',
};

class NoodleServer {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.clientCounter = 0;
    this.lineStatus = new Map();      // 라인별 상태 관리
    this.lineQueues = new Map();      // 라인별 대기열
    this.processes = new Map();       // 공정별 상태 관리
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
      switch (recv.type) {
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
          console.log(`📦 [${clientId}] 작업 시작 요청:`, data);
          await this.startProcess(data);
          this.sendToClient(clientId, {
            type: 'PROCESS_STARTED',
            message: `작업이 시작되었습니다: ${data.prdr_code}`,
            data: data,
            timestamp: Date.now()
          });
          console.log(data.prdr_code, '작업 시작 요청 처리 완료', data);
          break;

        // case 'GET_PRDR_INFO':
        //   // PRDR 정보 요청 처리
        //   const wkoCode = recv.message;


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
      if (error instanceof MaterialStockShortageError) {
        // 자재 재고 부족 에러 처리
        this.sendToClient(clientId, {
          type: 'MATERIAL_SHORTAGE',
          message: error.message,
          shortageList: error.shortageList,
          timestamp: Date.now()
        });
      }
      else {
        // 일반 메시지 파싱 오류 처리
        console.error(`❌ [${clientId}] 메시지 파싱 오류:`, error);
        this.sendToClient(clientId, {
          type: 'ERROR',
          message: '메시지 형식이 올바르지 않습니다.',
          timestamp: Date.now()
        });
      }
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

    const prdrDetail = {};

    // PRDR 코드가 없다면 신규 등록
    if (data.prdr_code == null || data.prdr_code === '') {
      await this.insertPrdr(data);
      console.log(`✅ PRDR 코드 ${data.prdr_code} 저장 완료`);

      await this.requestStartWork(data);
    }
    // PRDR 코드가 있다면 작업 재개
    else {

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
        data.prod_code ?? 'PROD-1001',
      ];
      const result = await mariadb.queryConn(conn, 'insertPRDR', prdrData);

      if (result.affectedRows > 0) {
        console.log(`✅ PRDR 코드 ${prdrCode} 저장 성공`);
        this.broadcast({
          type: 'PRDR_CREATED',
          wkoCode: data.wko_code,
          lineCode: data.line_code,
          prdrCode: prdrCode,
          timestamp: Date.now()
        });
      }
      else {
        console.error(`❌ PRDR 코드 ${prdrCode} 저장 실패`);
        throw new Error(`PRDR 코드 ${prdrCode} 저장 실패`);
      }

      // // 자재 재고 상태 파악
      // const materialList = await this.checkMatStock(conn, prdrCode);

      // 라인 공정 코드 목록 조회
      const lineEQCodeList = await mariadb.queryConn(conn, 'selectLineDetailList', [data.wko_code ?? 'WKO-20250605-001']);
      console.log('라인 공정 코드 목록:', lineEQCodeList);
      // const prdrDCodeList = [];

      for (const lineEqCode of lineEQCodeList) {
        const prdrDCodeRes = await mariadb.queryConn(conn, 'selectPRDRDCode');
        const prdrDCode = prdrDCodeRes[0].prdr_d_code;
        // prdrDCodeList.push(prdrDCode);

        const prdrDData = [prdrDCode, prdrCode, lineEqCode.line_eq_code];
        const prdrDRes = await mariadb.queryConn(conn, 'insertPRDRD', prdrDData);

        if (prdrDRes.affectedRows > 0) {
          console.log(`✅ PRDR-D 코드 ${prdrDCode} 저장 성공`);
          this.broadcast({
            type: 'PRDRD_CREATED',
            wkoCode: data.wko_code,
            lineCode: data.line_code,
            prdrDCode: prdrDCode,
            eqCode: lineEqCode.eq_code,
            timestamp: Date.now()
          });
        }
        else {
          console.error(`❌ PRDR-D 코드 ${prdrDCode} 저장 실패`);
          throw new Error(`PRDR-D 코드 ${prdrDCode} 저장 실패`);
        }
      }

      const prdrDCodeRes = await mariadb.queryConn(conn, 'selectPrdrDCodeForDetail', [data.wko_code ?? 'WKO-20250606-001', data.eq_code ?? 'EQ-MIX-0001']);
      const prdrDCode = prdrDCodeRes[0].prdr_d_code;
      console.log('PRDR-D 코드 조회 결과:', prdrDCode);

      // 자재 출고 처리
      // await this.releaseMaterials(conn, prdrCode, data.emp_code ?? 'EMP-10001', materialList);

      await conn.commit(); // 트랜잭션 커밋
      console.log('✅ PRDR 저장 트랜잭션 성공:', prdrCode, prdrDCode);

      data.prdr_code = prdrCode;
      data.prdr_d_code = prdrDCode;

      // await conn.rollback(); // 트랜잭션 커밋은 하지 않고 롤백 (테스트용)

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

  // 자재 재고 상태 파악
  async checkMatStock(conn, prdrCode) {
    // 자재 재고 조회
    const materialList = await mariadb.queryConn(conn, 'selectMaterialListForPRDR', [prdrCode]);
    console.log('자재 목록:', materialList);

    // 자재 목록이 비어있다면 에러 처리
    if (!materialList || materialList.length === 0) {
      console.error('❌ 자재 목록이 비어있습니다. 생산을 진행할 수 없습니다.');
      throw new Error('자재 목록이 비어있습니다. 생산을 진행할 수 없습니다.');
    }

    // 자재 재고가 부족한 자재의 이름들을 저장하는 배열
    const insufficientMaterials = [];

    // 자재가 재고보다 적거나 없다면 생산 진행 하면 안 됨
    for (const material of materialList) {
      if (material.cur_qtt < material.req_qtt) {
        console.error(`❌ 자재 ${material.mat_code}의 재고가 부족합니다. 현재: ${material.cur_qtt}, 필요: ${material.req_qtt}`);
        insufficientMaterials.push(material.mat_name);
      }
      else {
        console.log(`✅ 자재 ${material.mat_code}의 재고가 충분합니다. 현재: ${material.cur_qtt}, 필요: ${material.req_qtt}`);
      }
    }

    // 재고가 부족한 자재가 있다면 에러 처리
    if (insufficientMaterials.length > 0) {
      console.error(`❌ 다음 자재의 재고가 부족합니다: ${insufficientMaterials.join(', ')}`);
      throw new MaterialStockShortageError(insufficientMaterials);
    }

    return materialList; // 재고가 충분한 자재 목록 반환
  }

  // 자재 출고 처리
  async releaseMaterials(conn, prdrCode, empCode, materialList) {
    for (const material of materialList) {
      // 자재 출고 코드 생성
      const moutbndCodeRes = await mariadb.queryConn(conn, 'selectMoutbndCode');
      const moutbndCode = moutbndCodeRes[0].moutbnd_code;
      console.log('생성된 자재 출고 코드:', moutbndCode);
      console.log('자재 출고 코드:', moutbndCode, '자재 코드:', material.mat_code, '요청 수량:', material.req_qtt);

      // 자재 출고 데이터 생성
      const moutbndData = [
        moutbndCode,
        unitMapper[material.unit] || material.unit, // 단위 매핑
        material.req_qtt,
        empCode,
        material.mat_code,
        prdrCode
      ];

      // 자재 출고 DB에 저장
      const result = await mariadb.queryConn(conn, 'insertMoutbnd', moutbndData);
      if (result.affectedRows > 0) {
        console.log(`✅ 자재 ${material.mat_code} 출고 성공: ${material.req_qtt}`);
      } else {
        console.error(`❌ 자재 ${material.mat_code} 출고 실패`);
        throw new Error(`자재 ${material.mat_code} 출고 실패`);
      }
    }
  }

  // 작업 시작 요청
  async requestStartWork(data) {
    const wkoCode = data.wko_code;
    const lineCode = data.line_code;
    const prdrCode = data.prdr_code;
    const wkoQtt = data.wko_qtt;

    const lineState = this.getLineStatus(lineCode);

    if (lineState === 'IDLE') {
      // 라인이 비어있으면 즉시 시작
      await this.startWorkOnLine(wkoCode, lineCode, prdrCode, wkoQtt);
    } else {
      // 라인이 사용 중이면 대기열에 추가
      await this.addToLineQueue(lineCode, { wkoCode, prdrCode, wkoQtt });

      this.broadcast({
        type: 'WORK_QUEUED',
        message: `${lineCode} 라인이 사용 중입니다. 대기열에 추가되었습니다.`,
        lineCode,
        queuePosition: this.getQueuePosition(lineCode)
      });
    }
  }

  // 라인 상태 확인
  getLineStatus(lineCode) {
    return this.lineStatus.get(lineCode) || 'IDLE';
  }

  // 라인에서 작업 시작
  async startWorkOnLine(wkoCode, lineCode, prdrCode, wkoQtt) {
    // 라인 상태를 BUSY로 변경
    this.lineStatus.set(lineCode, 'BUSY');

    this.broadcast({
      type: 'WORK_STARTED',
      wkoCode,
      lineCode,
      prdrCode,
      timestamp: Date.now()
    });

    // 실제 공정 진행 시작...
    await this.processWork(wkoCode, lineCode, prdrCode, wkoQtt);
  }

  // 작업 완료 시
  async onWorkCompleted(wkoCode, lineCode, prdrCode) {
    // 라인 상태를 IDLE로 변경
    this.lineStatus.set(lineCode, 'IDLE');

    this.broadcast({
      type: 'WORK_COMPLETED',
      wkoCode,
      lineCode,
      timestamp: Date.now()
    });

    console.log(`라인 ${lineCode}에서 PRDR 코드 ${prdrCode}의 작업이 완료되었습니다.`);

    await this.updateProcess(prdrCode, 'b3'); // 생산 완료 상태로 업데이트

    // 대기열에 다음 작업이 있으면 시작
    await this.processLineQueue(lineCode);
  }

  async updateProcess(prdrCode, prodStat) {
    console.log(`PRDR 코드 ${prdrCode} 상태 업데이트: ${prodStat}`);
    console.log(`PRDR 코드 ${prdrCode} 상태 업데이트: ${prodStat}`);
    console.log(`PRDR 코드 ${prdrCode} 상태 업데이트: ${prodStat}`);
    console.log(`PRDR 코드 ${prdrCode} 상태 업데이트: ${prodStat}`);

    // DB에서 해당 PRDR 코드의 공정 완료 상태 업데이트
    // UPDATE prdr_d_tbl SET status = 'COMPLETED' WHERE prdr_code = ?
    const conn = await mariadb.connectionPool.getConnection();
    try {
      await conn.beginTransaction(); // 트랜잭션 시작

      const data = [prodStat, prdrCode];
      console.log(`PRDR-D 코드 ${prdrCode} 상태 업데이트: ${prodStat}`);

      if (prodStat === 'b3') {
        const result = await mariadb.queryConn(conn, 'updatePRDRComplete', data);
        if (result.affectedRows > 0) {
          console.log(`✅ PRDR-D 코드 ${prdrCode} 상태 업데이트 성공`);
        } else {
          console.error(`❌ PRDR-D 코드 ${prdrCode} 상태 업데이트 실패`);
        }

        const wkoResult = await mariadb.queryConn(conn, 'updateWKOComplete', [prdrCode]);
        if (wkoResult.affectedRows > 0) {
          console.log(`✅ WKO 코드 ${prdrCode} 상태 업데이트 성공`);
        } else {
          console.error(`❌ WKO 코드 ${prdrCode} 상태 업데이트 실패`);
        }
      }
      else {
        const result = await mariadb.queryConn(conn, 'updatePRDRStart', data);
        if (result.affectedRows > 0) {
          console.log(`✅ PRDR-D 코드 ${prdrCode} 상태 업데이트 성공`);
        } else {
          console.error(`❌ PRDR-D 코드 ${prdrCode} 상태 업데이트 실패`);
        }

        const wkoResult = await mariadb.queryConn(conn, 'updateWKOStart', [prdrCode]);
        if (wkoResult.affectedRows > 0) {
          console.log(`✅ WKO 코드 ${prdrCode} 상태 업데이트 성공`);
        } else {
          console.error(`❌ WKO 코드 ${prdrCode} 상태 업데이트 실패`);
        }

      }

      await conn.commit(); // 트랜잭션 커밋
    } catch (error) {
      await conn.rollback(); // 트랜잭션 롤백
      console.error(`❌ PRDR-D 코드 ${prdrCode} 상태 업데이트 중 오류:`, error);
    } finally {
      await conn.release(); // 컨넥션 반납
    }
  }


  // 라인별 대기열 처리
  async processLineQueue(lineCode) {
    const queue = this.lineQueues.get(lineCode) || [];

    if (queue.length > 0) {
      const nextWork = queue.shift();
      this.lineQueues.set(lineCode, queue);

      // 다음 작업 시작
      await this.startWorkOnLine(nextWork.wkoCode, lineCode, nextWork.prdrCode, nextWork.wkoQtt);
    }
  }

  // 대기열에 추가
  async addToLineQueue(lineCode, workData) {
    if (!this.lineQueues.has(lineCode)) {
      this.lineQueues.set(lineCode, []);
    }

    const queue = this.lineQueues.get(lineCode);
    queue.push({
      ...workData,
      queuedAt: Date.now()
    });
  }

  // 대기열 순서 확인
  getQueuePosition(lineCode) {
    const queue = this.lineQueues.get(lineCode) || [];
    return queue.length;
  }

  // 작업 처리 메인 함수
  async processWork(wkoCode, lineCode, prdrCode, qtt) {
    try {
      // 1. 해당 작업의 공정 목록 조회 (DB 호출)
      const processes = await this.getProcessList(prdrCode);

      // 1-1. 작업 진행 상태 변경
      await this.updateProcess(prdrCode, 'b2');

      let currentQtt = qtt; // 현재 수량 (이전 공정의 출력이 다음 공정의 입력)

      // 2. 각 공정을 순차적으로 처리 (동기식)
      for (let i = 0; i < processes.length; i++) {
        const process = processes[i];

        // 공정 시작 브로드캐스트
        this.broadcast({
          type: 'PROCESS_STARTED',
          processId: process.prdr_d_code,
          processName: process.po_name,
          wkoCode,
          lineCode,
          process: process,
          inputQtt: currentQtt,
          timestamp: Date.now()
        });

        // 공정 초기 설정
        process.input_qtt = currentQtt; // 이전 공정의 출력이 현재 공정의 입력
        process.def_qtt = 0; // 불량 수량 초기화
        process.make_qtt = 0; // 생산 수량 초기화

        console.log(`🚀 공정 ${i + 1}/${processes.length} 시작: ${process.po_name} (입력: ${currentQtt})`);

        // 공정 완료까지 대기 (동기식)
        await this.simulateProcess(process);

        // 다음 공정을 위한 수량 업데이트
        currentQtt = process.make_qtt; // 현재 공정의 출력이 다음 공정의 입력

        console.log(`✅ 공정 ${i + 1} 완료: ${process.po_name} (출력: ${currentQtt})`);

        // 공정 간 잠깐 대기 (선택사항)
        if (i < processes.length - 1) {
          console.log('⏱️  다음 공정 준비 중...');
          await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 대기
        }
      }

      console.log('🎉 모든 공정 완료!');

      // 4. 모든 공정 완료
      await this.onWorkCompleted(wkoCode, lineCode, prdrCode);

    } catch (error) {
      console.error('작업 처리 중 오류:', error);
      this.onWorkError(wkoCode, lineCode, error);
    }
  }

  // 개별 공정 시뮬레이션 (변경 없음)
  async simulateProcess(process) {
    return new Promise((resolve) => {
      let progress = 0;

      // 작업 시작 시 공정 시작 일자 등록
      this.updateProcessProgress(process.prdr_d_code, progress, process.input_qtt);

      const interval = setInterval(() => {
        process.make_qtt += process.capacity; // 공정별 생산 수량 증가
        if (process.make_qtt > process.input_qtt) {
          process.make_qtt = process.input_qtt; // 생산 수량이 입력 수량을 초과하지 않도록 조정
        }

        // 진행률 계산 후 소수점 2자리로 표시
        progress = Math.min(100, parseFloat((process.make_qtt / process.input_qtt * 100).toFixed(2)));

        // 진행률 브로드캐스트
        this.broadcast({
          type: 'PROCESS_UPDATE',
          processId: process.prdr_d_code,
          progress: progress,
          inputQtt: process.input_qtt,
          makeQtt: process.make_qtt,
          timestamp: Date.now()
        });

        this.updateProcessProgress(process.prdr_d_code, progress, process.make_qtt);

        if (progress >= 100) {
          clearInterval(interval);

          // 공정 완료 알림
          this.broadcast({
            type: 'PROCESS_COMPLETED',
            processId: process.prdr_d_code,
            progress: progress,
            inputQtt: process.input_qtt,
            makeQtt: process.make_qtt,
            timestamp: Date.now()
          });

          resolve();
        }
      }, 1000);
    });
  }

  // DB에서 공정 목록 조회
  async getProcessList(prdrCode) {
    const result = await mariadb.query('selectPrdrDCodeByWkoCode', [prdrCode]);
    if (!result || result.length === 0) {
      throw new Error(`공정 목록을 찾을 수 없습니다: ${prdrCode}`);
    }
    return result;
  }

  
  // DB의 진행률 업데이트
  async updateProcessProgress(prdrDCode, progress, qtt) {
    // UPDATE prdr_d_tbl SET proc_rate = ? WHERE prdr_d_code = ?
    const conn = await mariadb.connectionPool.getConnection();
    try {
      await conn.beginTransaction(); // 트랜잭션 시작

      let result;
      if (progress >= 100) {
        result = await mariadb.queryConn(conn, 'updatePRDRDComplete', [progress, qtt, prdrDCode]);
      }
      else if (progress === 0) {
        result = await mariadb.queryConn(conn, 'updatePRDRDStart', [progress, qtt, prdrDCode]);
      }
      else {
        result = await mariadb.queryConn(conn, 'updatePRDRDRate', [progress, qtt, prdrDCode]);
      }

      if (result.affectedRows > 0) {
        console.log(`✅ 공정 ${prdrDCode} 진행률 업데이트 성공: ${progress}%`);
      } else {
        console.error(`❌ 공정 ${prdrDCode} 진행률 업데이트 실패`);
      }

      await conn.commit(); // 트랜잭션 커밋
    } catch (error) {
      await conn.rollback(); // 트랜잭션 롤백
      console.error(`❌ 공정 ${prdrDCode} 진행률 업데이트 중 오류:`, error);
    } finally {
      conn.release(); // 컨넥션 반납
    }
  }

  onWorkError(wkoCode, lineCode, error) {
    // 에러 처리 로직
    this.lineStatus.set(lineCode, 'ERROR');
    this.broadcast({ type: 'WORK_ERROR', wkoCode, error: error.message });
  }

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

  // 대기
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

class MaterialStockShortageError extends Error {
  constructor(shortageList) {
    // shortageList: ['밀가루', '설탕', '소금'] 형태
    const message = `다음 자재의 재고가 부족합니다: ${shortageList.join(', ')}`;
    super(message);
    this.name = 'MaterialStockShortageError';
    this.shortageList = shortageList;
  }
}



module.exports = NoodleServer;