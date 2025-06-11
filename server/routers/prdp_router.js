const express = require('express');
 // Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const prdpService = require('../services/prdp_service.js');

// 라우팅  = 사용자의 요청(URL+METHOD) + Service + 응답형태(View or Data)
// 실제 라우팅 등록 영역

// 전체조회 : 자원(데이터) -> books / 조회 -> GET
router.get('/all', async (req, res)=>{
    // 해당 엔드포인트(URL+METHOD)로 접속할 경우 제공되는 서비스를 실행
    // -> 서비스가 DB에 접속하므로 비동기 작업, await/async를 활용해서 동기식으로 동작하도록 진행
    let prdpList = await prdpService.findAll()
                                    .catch(err => console.log(err));

    // res(Http Response에 대응되는 변수)의 응답메소드를 호출해 데이터를 반환하거나 통신을 종료함 
    // 주의사항) res(Http Response에 대응되는 변수)의 응답메소드를 호출하지 않으면 통신이 종료되지 않음                   
    // res.send()는 데이터를 반환하는 응답 메소드며 객체로 반환되므로 JSON으로 자동 변환
    res.send(prdpList); 
});
// 해당하는 달 조회
router.get('/selectMonth', async (req, res)=>{
    let monthList = await prdpService.selectMonth()
                                    .catch(err => console.log(err));
    res.send(monthList); 
});
// 라인전체조회
router.get('/line', async (req, res)=>{
    let lineList = await prdpService.findLine()
                                    .catch(err => console.log(err));
    res.send(lineList); 
});

// 제품전체조회
router.get('/product', async (req, res)=>{
    let prodList = await prdpService.findProd()
                                    .catch(err => console.log(err));
    res.send(prodList); 
});

router.get('/detail/one', async (req, res) => {
  try {
    const prdpCode = req.query.prdp_code;
    const result = await prdpService.findDetail(prdpCode);
    res.json(result);
  } catch (err) {
    console.error('상세 데이터 조회 실패:', err);
    res.status(500).send('Internal Server Error');
  }
});


// 해당 javascript 파일의 마지막 코드, 모듈화
// 위에 선언한 기능(변수, 함수 등)들 중 외부로 노출할 대상을 설정 
// => 다른 파일에서 require()을 통해 가져옴
module.exports = router;