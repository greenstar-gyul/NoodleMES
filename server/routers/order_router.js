const express = require('express');
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const orderService = require('../services/order_service.js');

// 라우팅  = 사용자의 요청(URL+METHOD) + Service + 응답형태(View or Data)
// 실제 라우팅 등록 영역

// 전체조회 : 자원(데이터) -> books / 조회 -> GET
router.get('/all', async (req, res) => {
    try {
        const result = await orderService.findAllOrders();
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        console.error("전체 주문 조회 실패:", err);
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 날짜 조건을 반영한 주문 조회
router.get('/date', async (req, res) => {
    const { ord_date_from, ord_date_to } = req.query;

    try {
        // 둘 다 존재하는 경우에만 진행
        if (!ord_date_from || !ord_date_to) {
            return res.status(400).json({
                result_code: "FAIL",
                message: "실패",
                error: "ord_date_from 또는 ord_date_to가 누락되었습니다."
            });
        }

        const result = await orderService.findOrdersWithDate(ord_date_from, ord_date_to);

        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        console.error("날짜 조건 주문 조회 실패:", err);
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 검색조건에 맞는 주문 조회
router.get('/search', async (req, res) => {
  try {
    const result = await orderService.findOrdersByCondition(req.query);
    res.json({
      result_code: "SUCCESS",
      message: "성공",
      data: result
    });
  } catch (err) {
    console.error("조건 검색 실패:", err);
    res.status(500).json({
      result_code: "FAIL",
      message: "실패",
      error: err.message
    });
  }
});


// 특정 주문의 상세 목록 조회
router.get('/:ordCode/details', async (req, res) => {
    try {
        const { ordCode } = req.params;
        const result = await orderService.findOrderDetails(ordCode);
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        console.error("주문 상세 조회 실패:", err);
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 주문 등록
router.post('/', async (req, res) => {
    const { order, details } = req.body;

    // order: [ord_code, ord_name, ord_date, ord_stat, note, mcode, client_code]
    // details: 배열 - 각 요소가 insertOrderDetail에 들어갈 배열

    const regOrder = {
        orderData: order,
        detailData: details
    };

    try {
        const result = await orderService.insertOrderTx(regOrder);

        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        console.error("주문 등록 실패:", err);
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 주문 삭제 (기본정보 + 상세정보 같이 삭제)
router.delete('/:ordCode', async (req, res) => {
    try {
        const { ordCode } = req.params;
        const result = await orderService.deleteOrderTx(ordCode);
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        console.error("주문 삭제 실패:", err);
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});


// 거래처 목록 조회
router.get('/clients', async (req, res) => {
    try {
        const result = await orderService.findClientList();
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        console.error("거래처 목록 조회 실패:", err);
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 주문 상태 조회
router.get('/statuses', async (req, res) => {
    try {
        const result = await orderService.findOrderStatuses();
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        console.error("주문 상태 조회 실패:", err);
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 제품 전체 목록 조회
router.get("/products", async (req, res) => {
  try {
    const result = await orderService.findProductList();
    res.json({
        result_code: "SUCCESS",
        message: "성공",
        data: result
    });
  } catch (err) {
    console.error("제품 목록 조회 실패:", err);
    res.status(500).json({
        result_code: "FAIL",
        message: "실패",
        error: err.message
    });
  }
});

// 제품명으로 검색
router.get("/products/search", async (req, res) => {
  try {
    const { name } = req.query;
    const result = await orderService.findProductByName(name);
    res.json({
        result_code: "SUCCESS",
        message: "성공",
        data: result
    });
  } catch (err) {
    console.error("제품명 검색 실패:", err);
    res.status(500).json({
        result_code: "FAIL",
        message: "실패",
        error: err.message
    });
  }
});



// 출고 목록 조회
router.get('/releases', async (req, res) => {
  try {
    const result = await orderService.findReleaseList();
    res.json({
      result_code: "SUCCESS",
      message: "성공",
      data: result
    });
  } catch (err) {
    console.error("출고요청 목록 조회 실패:", err);
    res.status(500).json({
      result_code: "FAIL",
      message: "실패",
      error: err.message
    });
  }
});

// 출고 상태 목록 조회
router.get("/releases/statuses", async (req, res) => {
  try {
    const result = await orderService.findReleaseStatuses();
    res.json({
        result_code: "SUCCESS",
        message: "성공",
        data: result
    });
  } catch (err) {
    console.error("출고 상태 조회 실패:", err);
    res.status(500).json({
        result_code: "FAIL",
        message: "실패",
        error: err.message
    });
  }
});

// 출고 상태 변경
router.put("/releases/:poutbndCode/status", async (req, res) => {
  try {
    const { poutbndCode } = req.params;
    const { stat } = req.body;

    const result = await orderService.updateReleaseStat(stat, poutbndCode);

    res.json({
      result_code: "SUCCESS",
      message: "성공",
      data: result
    });
  } catch (err) {
    console.error("출고 상태 업데이트 실패:", err);
    res.status(500).json({
      result_code: "FAIL",
      message: "실패",
      error: err.message
    });
  }
});

// 출고 등록 (여러 제품 포함)
router.post('/releases', async (req, res) => {
  try {
    const result = await orderService.insertFinalRelease(req.body);
    res.json({
      result_code: "SUCCESS",
      message: "성공",
      data: result
    });
  } catch (err) {
    console.error("출고 등록 실패:", err);
    res.status(500).json({
      result_code: "FAIL",
      message: "실패",
      error: err.message
    });
  }
});


// 출고 수정 (여러 제품 한꺼번에)
router.put('/releases/:poutbndCode', async (req, res) => {
  try {
    const { poutbndCode } = req.params;
    const { details } = req.body; // 배열로 받아야 함

    const result = await orderService.updateReleaseBatch(poutbndCode, details); // <-- 여기 핵심 변경

    res.json({
      result_code: "SUCCESS",
      message: "성공",
      data: result
    });
  } catch (err) {
    console.error("출고 수정 실패:", err);
    res.status(500).json({
      result_code: "FAIL",
      message: "실패",
      error: err.message
    });
  }
});

// 출고 상세 조회
router.get('/releases/:poutbndCode', async (req, res) => {
  try {
    const { poutbndCode } = req.params;
    const result = await orderService.findReleaseDetails(poutbndCode);
    res.json({
      result_code: "SUCCESS",
      message: "성공",
      data: result
    });
  } catch (err) {
    console.error("출고 상세 조회 실패:", err);
    res.status(500).json({
      result_code: "FAIL",
      message: "실패",
      error: err.message
    });
  }
});

// 출고요청코드 기준 출고 상세 조회
router.get('/releases/recode/:outReqCode', async (req, res) => {
  try {
    const { outReqCode } = req.params;
    const result = await orderService.getReleaseByOutReqCode(outReqCode);

    res.json({
      result_code: "SUCCESS",
      message: "성공",
      data: result
    });
  } catch (err) {
    console.error("출고요청 상세 조회 실패:", err);
    res.status(500).json({
      result_code: "FAIL",
      message: "실패",
      error: err.message
    });
  }
});

// 출고정보 팝업용 요약 목록 조회
router.get('/releases/popup', async (req, res) => {
  try {
    const result = await orderService.findReleasePopList();
    res.json({
      result_code: "SUCCESS",
      message: "성공",
      data: result
    });
  } catch (err) {
    console.error("출고 팝업 목록 조회 실패:", err);
    res.status(500).json({
      result_code: "FAIL",
      message: "실패",
      error: err.message
    });
  }
});


// 출고 목록 조회
router.get('/releaseData', async (req, res) => {
  try {
    const result = await orderService.findReleaseDataForList();
    res.json({ result_code: 'SUCCESS', message: '성공', data: result });
  } catch (err) {
    res.json({ result_code: 'FAIL', message: '실패', error: err.message });
  }
});


// 출고 목록 검색 조건 조회
router.get('/releaseData/search', async (req, res) => {
  try {
    const result = await orderService.findReleasesByCondition(req.query);
    res.json({
      result_code: "SUCCESS",
      message: "성공",
      data: result
    });
  } catch (err) {
    console.error("출고 조건 검색 실패:", err);
    res.status(500).json({
      result_code: "FAIL",
      message: "실패",
      error: err.message
    });
  }
});




// 해당 javascript 파일의 마지막 코드, 모듈화
// 위에 선언한 기능(변수, 함수 등)들 중 외부로 노출할 대상을 설정 
// => 다른 파일에서 require()을 통해 가져옴
module.exports = router;