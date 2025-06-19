const express = require('express');
const router = express.Router();

// 서비스 함수들 import
const { findAll, insertQlt, insertQcrTx } = require('../services/qlt_service');


// 라우팅  = 사용자의 요청(URL+METHOD) + Service + 응답형태(View or Data)
// 실제 라우팅 등록 영역

// 전체조회 : 자원(데이터) -> books / 조회 -> GET
router.get('/search', async (req, res) => {
  // 해당 엔드포인트(URL+METHOD)로 접속할 경우 제공되는 서비스를 실행
  // -> 서비스가 DB에 접속하므로 비동기 작업, await/async를 활용해서 동기식으로 동작하도록 진행
  let data = req.query;
  let qltList = await qltService.findAll()
    .catch(err => console.log(err));

  // res(Http Response에 대응되는 변수)의 응답메소드를 호출해 데이터를 반환하거나 통신을 종료함 
  // 주의사항) res(Http Response에 대응되는 변수)의 응답메소드를 호출하지 않으면 통신이 종료되지 않음                   
  // res.send()는 데이터를 반환하는 응답 메소드며 객체로 반환되므로 JSON으로 자동 변환
  res.send(qltList);
});

// 전체 품질 기준 조회
router.get('/all', async (req, res) => {
  try {
    const result = await findAll();
    res.status(200).json(result);
  } catch (err) {
    console.error('❌ 품질 기준 전체 조회 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 품질 기준 등록
router.post('/register', async (req, res) => {
  try {
    const qcrDataList = req.body;

    console.log('📦 받은 데이터:', qcrDataList);

    // if (!Array.isArray(qcrDataList) || qcrDataList.length === 0) {
    //   return res.status(400).json({ success: false, message: '유효하지 않은 데이터입니다.' });
    // }

    const result = await insertQcrTx(qcrDataList);
    res.status(200).json({ success: true, qcr_codes: result.qcr_codes });
  } catch (err) {
    console.error('❌ 품질 기준 등록 API 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

<<<<<<< HEAD
module.exports = router;
=======

// 해당 javascript 파일의 마지막 코드, 모듈화
// 위에 선언한 기능(변수, 함수 등)들 중 외부로 노출할 대상을 설정 
// => 다른 파일에서 require()을 통해 가져옴

router.get('/qio', async (req, res) => {
  try {
    let qioList = await qltService.getQioList();
    res.send(qioList);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: '조회 실패' });
  }
});

router.get('/qio/:code', async (req, res) => {
  try {
    const qioCode = req.params.code;
    const qioData = await qltService.searchQioListByCode(qioCode);
    if (qioData.length > 0) {
      res.json({ success: true, data: qioData[0] });
    } else {
      res.status(404).json({ success: false, message: 'QIO 코드가 존재하지 않습니다.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/qio/prdr/:qioCode', async (req, res) => {
  try {
    const qioCode = req.params.qioCode;
    const prdrList = await qltService.searchPrdrListByQioCode(qioCode);
    res.json({ success: true, data: prdrList });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;
>>>>>>> c34fc129eff3a6790b3bb302aa83bfc2bda68da6
