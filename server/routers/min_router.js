const express = require('express');
 // Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const minService = require('../services/min_service.js');
const { convertObjToAry } = require('../utils/converts.js');

// 라우팅  = 사용자의 요청(URL+METHOD) + Service + 응답형태(View or Data)
// 실제 라우팅 등록 영역

// 전체 자재입고목록조회
router.get('/all', async (req, res)=>{
    // 해당 엔드포인트(URL+METHOD)로 접속할 경우 제공되는 서비스를 실행
    // -> 서비스가 DB에 접속하므로 비동기 작업, await/async를 활용해서 동기식으로 동작하도록 진행
    let minList = await minService.findAllMin()
                                    .catch(err => 
                                        alert('오류 발생')
                                    );

    // res(Http Response에 대응되는 변수)의 응답메소드를 호출해 데이터를 반환하거나 통신을 종료함 
    // 주의사항) res(Http Response에 대응되는 변수)의 응답메소드를 호출하지 않으면 통신이 종료되지 않음                   
    // res.send()는 데이터를 반환하는 응답 메소드며 객체로 반환되므로 JSON으로 자동 변환
    res.send(minList); 
});

// 전체 자재입고 목록 조회
router.get('/min', async (req, res) => {
    try {
        const result = await minService.findAllMin();
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 검색조회
router.get('/search', async (req, res)=>{
    // 해당 엔드포인트(URL+METHOD)로 접속할 경우 제공되는 서비스를 실행
    // -> 서비스가 DB에 접속하므로 비동기 작업, await/async를 활용해서 동기식으로 동작하도록 진행
    const search = req.query;

    const values = convertObjToAry(search, ['mat_code','mat_type','inbnd_date_from','inbnd_date_to','mat_sup','mcode'])

    // console.log(values);
    let searchMinList = await minService.findSearchMin(values)
                                    .catch(err => console.log(err));

    // res(Http Response에 대응되는 변수)의 응답메소드를 호출해 데이터를 반환하거나 통신을 종료함 
    // 주의사항) res(Http Response에 대응되는 변수)의 응답메소드를 호출하지 않으면 통신이 종료되지 않음                   
    // res.send()는 데이터를 반환하는 응답 메소드며 객체로 반환되므로 JSON으로 자동 변환
    res.send(searchMinList); 
});

// 구간 날짜에 맞는 자재입고 목록 조회
router.get('/minDate', async (req, res) => {
    const { inbndDateFrom, inbndDateTo } = req.query;
    try {
        // 둘 다 존재하는 경우에만 진행
        if (!inbndDateFrom || !inbndDateTo) {
            return res.status(400).json({
                result_code: "FAIL",
                message: "실패",
                error: "inbndDateFrom 또는 inbndDateTo 누락되었습니다."
            });
        }

        const result = await minService.findMinsWithDate(inbndDateFrom, inbndDateTo);

        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 전체 자재기본 정보 조회
router.get('/mat', async (req, res) => {
    try {
        const result = await minService.findAllMat();
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        alert('오류 발생');
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 선택 자재 정보 조회
router.get('/selmat', async (req, res) => {
    const mat = req.query.mat_code;
    try {
        const result = await minService.findSelMat(mat);
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 전체 품질검사 정보 조회
router.get('/qio', async (req, res) => {
    try {
        const result = await minService.findAllQio();
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
        res.status(500).json({
            result_code: "FAIL",
            message: "실패",
            error: err.message
        });
    }
});

// 등록
router.post('/insert', async (req, res) => {
  const min = req.body;

  try {
    const result = await minService.insertMinAll(min);
      res.json({
      result_code: "SUCCESS",
      message: "성공",
      data: result
    });
  } catch (err) {
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
        const result = await minService.deleteMpr(mprCode);
        res.json({
            result_code: "SUCCESS",
            message: "성공",
            data: result
        });
    } catch (err) {
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