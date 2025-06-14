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
router.delete('/:ordCode', async (req, res) => {
    try {
        const { ordCode } = req.params;

        await orderService.deleteOrderTx(ordCode); // 삭제만 하고 결과값 따로 받을 필요 없음

        res.json({
            result_code: "SUCCESS",
            message: `주문 ${ordCode}가 삭제되었습니다.`,
            data: { ordCode } // 삭제한 주문 코드
        });
    } catch (err) {
        console.error("주문 삭제 실패:", err);
        res.status(500).json({
            result_code: "FAIL",
            message: "주문 삭제 중 오류가 발생했습니다.",
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


// 해당 javascript 파일의 마지막 코드, 모듈화
// 위에 선언한 기능(변수, 함수 등)들 중 외부로 노출할 대상을 설정 
// => 다른 파일에서 require()을 통해 가져옴
module.exports = router;