const express = require('express');
 // Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const bomService = require('../services/bom_service.js');

router.post('/register', async (req, res) => {
  try {
    const data = req.body;

    // 프론트에서 보낸 데이터 로그 확인
    console.log('📦 BOM 등록 요청 데이터:', data);

    const result = await bomService.insertProductAndBomTx(data);
    res.status(200).json({ message: '등록 완료', result });
  } catch (err) {
    console.error('❌ BOM 등록 중 에러:', err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 목록조회
router.get('/list', async (req, res) => {
  try {
    const list = await bomService.getBomList();
    res.send(list);
  } catch (err) {
    console.error('❌ BOM 목록 조회 중 에러:', err);
    res.status(500).send('BOM 목록 조회 실패');
  }
});

// 🔍 BOM 상세 조회 라우터
router.get('/detail', async (req, res) => {
  const bom_code = req.query.bom_code;

  if (!bom_code) {
    return res.status(400).send('bom_code is required');
  }

  try {
    const result = await bomService.findOneBomDetail(bom_code);
    res.json(result);
  } catch (err) {
    console.error('❌ BOM 상세 라우터 에러:', err);
    res.status(500).send('BOM 상세 조회 중 서버 오류');
  }
});

// 🔍 자재 + 반제품 팝업용 목록 조회
router.get('/materials-popup', async (req, res) => {
  try {
    const result = await bomService.getMaterialsForPopup(); // ✅ 여기서 정확히 일치해야 함
    res.send(result);
  } catch (err) {
    console.error('❌ 자재 팝업 조회 오류:', err);
    res.status(500).send('자재 목록 조회 실패');
  }
}); 

// 🔍 BOM 검색 목록 라우터
router.get('/list', async (req, res) => {
  try {
    const searchParams = req.query; // 프론트에서 넘어온 검색조건들
    const result = await bomService.searchBomList(searchParams); // ✅ 검색 서비스 사용
    res.json(result);
  } catch (err) {
    console.error('❌ BOM 검색 목록 라우터 에러:', err);
    res.status(500).send('서버 오류');
  }
});

module.exports = router;
