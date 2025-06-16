const express = require('express');

const router = express.Router();

const prdrService = require('../services/prdr_service.js');

// 📡 생산실적 월간 조회 API
router.get('/month', async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).send("❌ 시작일과 종료일이 필요합니다.");
  }

  try {
    const data = await prdrService.getMonthlyPerformance(start, end);
    res.send(data);
  } catch (err) {
    console.error('❌ 생산실적 월간 조회 실패:', err);
    res.status(500).send("서버 에러 발생");
  }
});

router.post('/search', async (req, res) => {
  try {
    const data = await prdrService.searchPrdr(req.body);  // 프론트에서 조건 전송
    res.send(data);
  } catch (err) {
    console.error('❌ 생산실적 검색 실패:', err);
    res.status(500).send("서버 오류 발생");
  }
});

module.exports = router;