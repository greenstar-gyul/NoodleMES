const express = require('express');
 // Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const orderService = require('../services/order_service.js');

// 라우팅  = 사용자의 요청(URL+METHOD) + Service + 응답형태(View or Data)
// 실제 라우팅 등록 영역

// 1. 전체조회 : 자원(데이터) -> books / 조회 -> GET
router.get('/all', async (req, res)=>{
    // 해당 엔드포인트(URL+METHOD)로 접속할 경우 제공되는 서비스를 실행
    // -> 서비스가 DB에 접속하므로 비동기 작업, await/async를 활용해서 동기식으로 동작하도록 진행
    let orderList = await orderService.findAll()
        .catch(err => console.log(err));

    // res(Http Response에 대응되는 변수)의 응답메소드를 호출해 데이터를 반환하거나 통신을 종료함 
    // 주의사항) res(Http Response에 대응되는 변수)의 응답메소드를 호출하지 않으면 통신이 종료되지 않음                   
    // res.send()는 데이터를 반환하는 응답 메소드며 객체로 반환되므로 JSON으로 자동 변환
    res.send(orderList);
});

// 2. 특정 주문의 상세 목록 조회
router.get('/:ordCode/details', async (req, res) => {
    // 파라미터에서 주문 코드 추출
    const ordCode = req.params.ordCode;

    // 해당 주문에 대한 상세 제품 목록 조회
    const details = await orderService.findDetailByOrdCode(ordCode)
        .catch(err => console.log(err));
    res.send(details); // 결과 반환
});

// 3. 주문 등록
router.post('/', async (req, res) => {
    const { order, details } = req.body;

    // order: [ord_code, ord_name, ord_date, ord_stat, note, mcode, client_code]
    // details: 배열 - 각 요소가 insertOrderDetail에 들어갈 배열

    // 주문 기본 등록
    await orderService.insertOrder(order)
        .catch(err => console.log(err));

    // 주문 상세 등록 (여러 개일 수 있으므로 forEach)
    for (let detail of details) {
        await orderService.insertOrderDetail(detail)
        .catch(err => console.log(err));
    }

    res.send({ message: '주문 등록 완료' });
});

// 4. 주문 삭제 (기본정보 + 상세정보 같이 삭제)
router.delete('/:ordCode', async (req, res) => {
    const ordCode = req.params.ordCode;

    // 주문 상세 먼저 삭제
    await orderService.deleteOrderDetail(ordCode)
        .catch(err => console.log(err));

    // 주문 본문 삭제
    await orderService.deleteOrder(ordCode)
        .catch(err => console.log(err));

    res.send({ message: '주문 삭제 완료' });
});

// 5. 거래처 목록 조회
router.get('/orders/clients', async (req, res) => {
    const clientList = await orderService.findClientList()
        .catch(err => console.log(err));
    res.send(clientList);
});

// 해당 javascript 파일의 마지막 코드, 모듈화
// 위에 선언한 기능(변수, 함수 등)들 중 외부로 노출할 대상을 설정 
// => 다른 파일에서 require()을 통해 가져옴
module.exports = router;