const express = require('express');
 // Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

const qcrService = require('../services/qcr_service.js');

// 전체 목록 조회
router.get('/list', async (req, res) => {

    let qcrList = await qcrService.qcrList()
                                .catch(err => console.log(err));
    res.send(qcrList);
});

// 품질기준정보 검색
router.get('/search', async (req, res) => {
     console.log('📥 받은 쿼리:', req.query); // 여기가 먼저!
  try {
    const result = await qcrService.searchQcrList(req.query);
    res.send(result);
  } catch (err) {
     console.error("❌ search 에러:", err); // 👉 콘솔 찍히는지 확인!
    res.status(500).send("검색 실패");
  }
});

// 품질 기준정보 단건 조회
router.get('/detail', async (req, res) => {
  const { qcr_code } = req.query;
  if (!qcr_code) {
    return res.status(400).send("qcr_code는 필수입니다");
  }

  try {
    const result = await qcrService.selectQcrOne(qcr_code);
    res.send(result);
  } catch (err) {
    res.status(500).send("조회 실패");
  }
});

// 품질기준정보 등록
router.post('/register', async (req, res) => {
  console.log('📥 등록 요청 데이터:', req.body);

  try {
    const result = await qcrService.insertQcrTx(req.body);
    res.status(201).send(result); // 201 Created
  } catch (err) {
    console.error("❌ 등록 에러:", err);
    res.status(500).send("등록 실패");
  }
});





module.exports = router;