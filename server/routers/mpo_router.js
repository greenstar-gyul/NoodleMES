const express = require('express');
 // Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const mprService = require('../services/mpo_service.js');
const { convertObjToAry } = require('../utils/converts.js');

// 라우팅  = 사용자의 요청(URL+METHOD) + Service + 응답형태(View or Data)
// 실제 라우팅 등록 영역

// 전체조회
router.get('/all', async (req, res)=>{
    // 해당 엔드포인트(URL+METHOD)로 접속할 경우 제공되는 서비스를 실행
    // -> 서비스가 DB에 접속하므로 비동기 작업, await/async를 활용해서 동기식으로 동작하도록 진행
    let mprList = await mprService.findAllMpr()
                                    .catch(err => console.log(err));

    // res(Http Response에 대응되는 변수)의 응답메소드를 호출해 데이터를 반환하거나 통신을 종료함 
    // 주의사항) res(Http Response에 대응되는 변수)의 응답메소드를 호출하지 않으면 통신이 종료되지 않음                   
    // res.send()는 데이터를 반환하는 응답 메소드며 객체로 반환되므로 JSON으로 자동 변환
    res.send(mprList); 
});

// 검색조회
router.get('/search', async (req, res)=>{
    // 해당 엔드포인트(URL+METHOD)로 접속할 경우 제공되는 서비스를 실행
    // -> 서비스가 DB에 접속하므로 비동기 작업, await/async를 활용해서 동기식으로 동작하도록 진행
    const search = req.query;

    const values = convertObjToAry(search, ['mpr_code','req_date_from','req_date_to','deadline_from','deadline_to','mrp_code','mcode'])

    // console.log(values);
    let mprList = await mprService.findSearchMpr(values)
                                    .catch(err => console.log(err));

    // res(Http Response에 대응되는 변수)의 응답메소드를 호출해 데이터를 반환하거나 통신을 종료함 
    // 주의사항) res(Http Response에 대응되는 변수)의 응답메소드를 호출하지 않으면 통신이 종료되지 않음                   
    // res.send()는 데이터를 반환하는 응답 메소드며 객체로 반환되므로 JSON으로 자동 변환
    res.send(mprList); 
});

// 특정 MPR의 상세 목록 조회
router.get('/:mprCode/details', async (req, res) => {
    try {
        const { mprCode } = req.params;
        const result = await mprService.findMprDetails(mprCode);
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

// 전체 MRP 목록 조회
router.get('/mrp', async (req, res) => {
    try {
        const result = await mprService.findAllMRP();
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        console.error("mrp 목록 조회 실패:", err);
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 전체 자재 목록 조회
router.get('/mat', async (req, res) => {
    try {
        const result = await mprService.findAllMat();
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        console.error("mrp 목록 조회 실패:", err);
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 등록
router.post('/insert', async (req, res) => {
  const { mpr, details } = req.body;

  const regMpr = {
    mprData: mpr,
    detailData: details,
  }
  console.log('mpr 출력 테스트 : ' + mpr);
  console.log('details 출력 테스트 : ' + details);

  try {
    const result = await mprService.insertMprAll(regMpr);

    res.json({
      result_code: "SUCCESS",
      message: "성공",
      data: result
    });

  } catch (err) {
      console.error("등록 실패 : ", err);
      res.status(500).json({
        result_code: "FAIL",
        message: "실패",
        err: err.message
      });
  }
});

// mpr 정보 삭제 (미완성)
router.delete('/:mprCode', async (req, res) => {
    try {
        const { mprCode } = req.params;
        const result = await mprService.deleteMpr(mprCode);
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        console.error("MPR 삭제 실패:", err);
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