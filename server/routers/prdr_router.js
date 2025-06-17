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

// 검색 조건에 맞게 조회
router.post('/search', async (req, res) => {
  try {
    const data = await prdrService.searchPrdr(req.body);  // 프론트에서 조건 전송
    res.send(data);
  } catch (err) {
    console.error('❌ 생산실적 검색 실패:', err);
    res.status(500).send("서버 오류 발생");
  }
});

// 📡 생산실적 상세 정보 조회 API
router.get('/detail', async (req, res) => {
  const { prdr_code } = req.query;
  if (!prdr_code) return res.status(400).send("prdr_code가 필요합니다.");

  try {
    const data = await prdrService.getPrdrDetail(prdr_code);
    if (!data) return res.status(404).send("해당 실적 없음");

    res.send(data);
  } catch (err) {
    console.error('❌ 상세 조회 실패:', err);
    res.status(500).send("서버 에러 발생");
  }
});

// 📡 생산실적 상세 설비 조회 API
router.get('/equipment', async (req, res) => {
  const { prdr_code } = req.query;

  if (!prdr_code) {
    return res.status(400).send("❌ prdr_code가 필요합니다.");
  }

  try {
    const data = await prdrService.findEquipmentByPrdr(prdr_code);
    res.send(data);
  } catch (err) {
    console.error('❌ 설비 조회 실패:', err);
    res.status(500).send("서버 오류 발생");
  }
});

module.exports = router;