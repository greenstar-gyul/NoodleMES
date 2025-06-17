// server/noodle-io/processSimulator.js
// 파이프라인 공정 진행 시뮬레이션

const { PROCESS_STATUS } = require('./eventTypes');

class ProcessSimulator {
  constructor(connectionManager, broadcaster) {
    this.connectionManager = connectionManager;
    this.broadcaster = broadcaster;
    
    // 전체 주문 정보
    this.orders = new Map(); // orderId -> orderInfo
    
    // 개별 제품 추적 (핵심!)
    this.products = new Map(); // productId -> productInfo
    
    // 공정별 현황
    this.processStations = new Map(); // processId -> stationInfo
    
    // 제품 ID 카운터
    this.productCounter = 0;
    
    // 시스템 시작 시간
    this.systemStartTime = Date.now();
  }

  // 작업 시작 (여러 제품을 파이프라인에 투입)
  startProcess(orderId, lineId, processFlow, productCount = 5) {
    // 이미 실행 중인 주문이면 중단
    if (this.orders.has(orderId)) {
      this.stopProcess(orderId);
    }

    // 주문 정보 생성
    const orderInfo = {
      orderId,
      lineId,
      processFlow: [...processFlow],
      productCount,
      startTime: Date.now(),
      status: 'RUNNING',
      completedProducts: 0
    };

    this.orders.set(orderId, orderInfo);

    // 공정 스테이션 초기화
    this.initializeProcessStations(processFlow);

    console.log(`파이프라인 시작: ${orderId} @ ${lineId} (제품 ${productCount}개)`);
    console.log(`공정 순서:`, processFlow);

    // 제품들을 순차적으로 파이프라인에 투입 (1초 간격)
    for (let i = 0; i < productCount; i++) {
      setTimeout(() => {
        this.createAndStartProduct(orderId, lineId, processFlow, i + 1);
      }, i * 1000); // 1초 간격으로 제품 투입
    }
  }

  // 공정 스테이션 초기화
  initializeProcessStations(processFlow) {
    processFlow.forEach(processId => {
      if (!this.processStations.has(processId)) {
        this.processStations.set(processId, {
          processId,
          capacity: this.getProcessCapacity(processId),
          processing: new Set(), // 현재 처리 중인 제품들
          queue: [], // 대기 중인 제품들
          totalProcessed: 0
        });
      }
    });
  }

  // 공정별 용량 설정
  getProcessCapacity(processId) {
    const capacities = {
      'PROC_001': 2,  // 원료투입: 동시 2개
      'PROC_002': 1,  // 혼합: 동시 1개
      'PROC_003': 2,  // 성형: 동시 2개
      'PROC_004': 3,  // 건조: 동시 3개
      'PROC_005': 1,  // 포장: 동시 1개
      'PROC_006': 2,  // 검사: 동시 2개
      'PROC_007': 1,  // 출하: 동시 1개
    };
    return capacities[processId] || 1;
  }

  // 공정별 소요 시간 설정
  getProcessDuration(processId) {
    const durations = {
      'PROC_001': 3000,  // 원료투입: 3초
      'PROC_002': 5000,  // 혼합: 5초
      'PROC_003': 4000,  // 성형: 4초
      'PROC_004': 6000,  // 건조: 6초
      'PROC_005': 2000,  // 포장: 2초
      'PROC_006': 3000,  // 검사: 3초
      'PROC_007': 2000,  // 출하: 2초
    };
    return durations[processId] || 4000;
  }

  // 새 제품 생성 및 첫 공정 시작
  createAndStartProduct(orderId, lineId, processFlow, productSequence) {
    const productId = `${orderId}_P${String(productSequence).padStart(3, '0')}`;
    
    const productInfo = {
      productId,
      orderId,
      lineId,
      processFlow: [...processFlow],
      currentProcessIndex: 0,
      status: 'PROCESSING',
      startTime: Date.now(),
      processHistory: [],
      timers: new Map() // processId -> timerId
    };

    this.products.set(productId, productInfo);

    console.log(`제품 생성: ${productId} (${productSequence}/${this.orders.get(orderId).productCount})`);

    // 첫 번째 공정 시작
    this.startProductProcess(productId, processFlow[0]);
  }

  // 특정 제품의 특정 공정 시작
  startProductProcess(productId, processId) {
    const product = this.products.get(productId);
    const station = this.processStations.get(processId);

    if (!product || !station) {
      console.error(`제품 또는 공정을 찾을 수 없음: ${productId}, ${processId}`);
      return;
    }

    // 공정 용량 확인
    if (station.processing.size >= station.capacity) {
      // 용량 초과 시 대기 큐에 추가
      station.queue.push(productId);
      console.log(`공정 대기: ${productId} → ${processId} (용량 초과)`);
      
      // 대기 상태 브로드캐스트
      this.broadcaster.broadcastProcessUpdate(
        product.orderId,
        product.lineId,
        processId,
        PROCESS_STATUS.WAITING,
        0,
        productId
      );
      return;
    }

    // 공정 시작
    station.processing.add(productId);
    const duration = this.getProcessDuration(processId);
    let progress = 0;

    console.log(`공정 시작: ${productId} @ ${processId} (${duration}ms)`);

    // 공정 시작 브로드캐스트
    this.broadcaster.broadcastProcessUpdate(
      product.orderId,
      product.lineId,
      processId,
      PROCESS_STATUS.IN_PROGRESS,
      0,
      productId
    );

    // 진행률 업데이트 타이머
    const updateInterval = 500;
    const progressIncrement = (100 / duration) * updateInterval;

    const timerId = setInterval(() => {
      progress += progressIncrement;

      if (progress >= 100) {
        // 공정 완료
        this.completeProductProcess(productId, processId, timerId);
      } else {
        // 진행 상황 브로드캐스트
        this.broadcaster.broadcastProcessUpdate(
          product.orderId,
          product.lineId,
          processId,
          PROCESS_STATUS.IN_PROGRESS,
          progress,
          productId
        );
      }
    }, updateInterval);

    // 타이머 저장
    product.timers.set(processId, timerId);
  }

  // 제품의 공정 완료 처리
  completeProductProcess(productId, processId, timerId) {
    const product = this.products.get(productId);
    const station = this.processStations.get(processId);

    if (!product || !station) return;

    // 타이머 정리
    clearInterval(timerId);
    product.timers.delete(processId);

    // 공정에서 제거
    station.processing.delete(productId);
    station.totalProcessed++;

    // 공정 완료 기록
    product.processHistory.push({
      processId,
      completedAt: Date.now(),
      duration: Date.now() - (product.processHistory.length > 0 
        ? product.processHistory[product.processHistory.length - 1].completedAt 
        : product.startTime)
    });

    console.log(`공정 완료: ${productId} @ ${processId}`);

    // 공정 완료 브로드캐스트
    this.broadcaster.broadcastProcessUpdate(
      product.orderId,
      product.lineId,
      processId,
      PROCESS_STATUS.COMPLETED,
      100,
      productId
    );

    // 대기 중인 제품이 있으면 다음 제품 시작
    this.processQueuedProduct(processId);

    // 다음 공정으로 이동
    this.moveToNextProcess(productId);
  }

  // 다음 공정으로 제품 이동
  moveToNextProcess(productId) {
    const product = this.products.get(productId);
    if (!product) return;

    product.currentProcessIndex++;

    if (product.currentProcessIndex >= product.processFlow.length) {
      // 모든 공정 완료
      this.completeProduct(productId);
    } else {
      // 다음 공정 시작 (500ms 후 - 이송 시간)
      const nextProcessId = product.processFlow[product.currentProcessIndex];
      setTimeout(() => {
        this.startProductProcess(productId, nextProcessId);
      }, 500);
    }
  }

  // 제품 완료 처리
  completeProduct(productId) {
    const product = this.products.get(productId);
    if (!product) return;

    const order = this.orders.get(product.orderId);
    if (!order) return;

    order.completedProducts++;
    product.status = 'COMPLETED';

    console.log(`제품 완료: ${productId} (${order.completedProducts}/${order.productCount})`);

    // 제품 완료 브로드캐스트
    this.broadcaster.broadcastCustom('PRODUCT_COMPLETED', {
      productId,
      orderId: product.orderId,
      lineId: product.lineId,
      totalTime: Date.now() - product.startTime,
      processHistory: product.processHistory
    });

    // 주문 완료 확인
    if (order.completedProducts >= order.productCount) {
      this.completeOrder(product.orderId);
    }
  }

  // 주문 완료 처리
  completeOrder(orderId) {
    const order = this.orders.get(orderId);
    if (!order) return;

    order.status = 'COMPLETED';
    console.log(`주문 완료: ${orderId}`);

    // 주문 완료 브로드캐스트
    this.broadcaster.broadcastWorkCompleted(orderId, order.lineId);
  }

  // 대기 중인 제품 처리
  processQueuedProduct(processId) {
    const station = this.processStations.get(processId);
    if (!station || station.queue.length === 0) return;

    if (station.processing.size < station.capacity) {
      const nextProductId = station.queue.shift();
      console.log(`대기 제품 시작: ${nextProductId} → ${processId}`);
      this.startProductProcess(nextProductId, processId);
    }
  }

  // 프로세스 중단
  stopProcess(orderId) {
    const order = this.orders.get(orderId);
    if (!order) return;

    console.log(`프로세스 중단: ${orderId}`);

    // 해당 주문의 모든 제품 타이머 정리
    this.products.forEach((product, productId) => {
      if (product.orderId === orderId) {
        product.timers.forEach((timerId, processId) => {
          clearInterval(timerId);
        });
        product.timers.clear();
        product.status = 'STOPPED';
      }
    });

    // 공정 스테이션에서 제품 제거
    this.processStations.forEach(station => {
      station.processing = new Set([...station.processing].filter(productId => {
        const product = this.products.get(productId);
        return !product || product.orderId !== orderId;
      }));
      
      station.queue = station.queue.filter(productId => {
        const product = this.products.get(productId);
        return !product || product.orderId !== orderId;
      });
    });

    order.status = 'STOPPED';
  }

  // 모든 프로세스 중단
  stopAllProcesses() {
    console.log('모든 프로세스를 중단합니다.');
    this.orders.forEach((order, orderId) => {
      this.stopProcess(orderId);
    });
  }

  // 실행 중인 프로세스 확인
  isProcessRunning(orderId) {
    const order = this.orders.get(orderId);
    return order && order.status === 'RUNNING';
  }

  // 전체 시스템 상태 조회
  getSystemStatus() {
    const runningOrders = [];
    const processingProducts = [];
    const stationStatus = [];

    this.orders.forEach(order => {
      if (order.status === 'RUNNING') {
        runningOrders.push({
          orderId: order.orderId,
          lineId: order.lineId,
          progress: `${order.completedProducts}/${order.productCount}`,
          startTime: order.startTime
        });
      }
    });

    this.products.forEach(product => {
      if (product.status === 'PROCESSING') {
        processingProducts.push({
          productId: product.productId,
          orderId: product.orderId,
          currentProcess: product.processFlow[product.currentProcessIndex],
          processStep: `${product.currentProcessIndex + 1}/${product.processFlow.length}`
        });
      }
    });

    this.processStations.forEach(station => {
      stationStatus.push({
        processId: station.processId,
        capacity: station.capacity,
        processing: station.processing.size,
        queued: station.queue.length,
        totalProcessed: station.totalProcessed,
        utilization: `${station.processing.size}/${station.capacity}`
      });
    });

    return {
      totalOrders: this.orders.size,
      runningOrders: runningOrders.length,
      totalProducts: this.products.size,
      processingProducts: processingProducts.length,
      orders: runningOrders,
      products: processingProducts,
      stations: stationStatus,
      systemUptime: Date.now() - this.systemStartTime
    };
  }

  // 실행 중인 프로세스 목록 (기존 API 호환용)
  getRunningProcesses() {
    const runningProcesses = [];
    this.orders.forEach(order => {
      if (order.status === 'RUNNING') {
        runningProcesses.push({
          orderId: order.orderId,
          lineId: order.lineId,
          currentStep: order.completedProducts,
          totalSteps: order.productCount,
          progress: (order.completedProducts / order.productCount) * 100,
          startTime: order.startTime,
          status: order.status
        });
      }
    });
    return runningProcesses;
  }
}

module.exports = ProcessSimulator;