const express = require('express');
const router = express.Router();

const workService = require('../services/work_service.js');

// 작업지시서 전체 조회
router.get('/all', async (req, res) => {
    try {
        const wkoList = await workService.findAll();
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": wkoList
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            "result_code": "FAIL",
            "message": "실패",
            "data": err.message || "서버 오류가 발생했습니다."
        });
    }
});

// 📡 작업진행 월간 조회 API
router.get('/month', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).send("❌ 시작일과 종료일이 필요합니다.");
  }
  try {
    const data = await workService.getMonthlyPerformance(start, end);
    res.send(data);
  } catch (err) {
    console.error('❌ 생산실적 월간 조회 실패:', err);
    res.status(500).send("서버 에러 발생");
  }
});

// 작업 지시서 코드로 상세의 공정 조회
router.get('/:wkoCode/process', async (req, res) => {
  const wko_code = req.params.wkoCode;
  // console.log('🔍 작업지시서 코드:', wko_code);
  try {
    const result = await workService.findProcessByWkoCode(wko_code);
    // console.log('🔍 조회된 공정 목록:', result);
    res.status(200).json({
        "result_code": "SUCCESS",
        "message": "성공",
        "data": result
    });
  } 
  catch (err) {
    console.error('❌ 공정 조회 실패:', err);
    res.status(500).json({
            "result_code": "FAIL",
            "message": "실패",
            "data": err.message || "서버 오류가 발생했습니다."
        });
  }
});

// 작업진행 조건 검색
router.post('/search', async (req, res) => {
  try {
    const result = await workService.searchWorkingList(req.body);
    res.status(200).json({
        "result_code": "SUCCESS",
        "message": "성공",
        "data": result
    });
  } 
  catch (err) {
    console.error('❌ 검색 실패:', err); // 🔍 원인 추적에 도움됨
    res.status(500).json({
            "result_code": "FAIL",
            "message": "실패",
            "data": err.message || "서버 오류가 발생했습니다."
        });
  }
});

// 작업 진행 상세 단건 조회
router.get('/detail/one', async (req, res) => {
  const { wko_code, eq_code } = req.query;

  console.log('📦 쿼리 파라미터:', req.query);  // 여기가 비어있으면 문제

  if (!wko_code || !eq_code) {
    return res.status(400).send('wko_code, eq_code는 필수입니다.');
  }

  try {
    const result = await workService.findWorkDetailOne(wko_code, eq_code);
    res.send(result);
  } catch (err) {
    console.error('❌ 작업진행 상세 조회 실패:', err);
    res.status(500).send('DB 오류');
  }
});

// 특정 wko_code 에 맞는 설비 목록 조회
router.get('/eqList', async (req, res) => {
  const { wko_code } = req.query;

  console.log('쿼리 파라미터:', req.query);

  if(!wko_code){
    return res.status(400).send('wko_code는 필수입니다.');
  }

  try{
    const result = await workService.findWkoCodeEqList(wko_code);
    res.send(result);
  }catch (err) {
    console.error('설비 목록 조회 실패 :', err);
    res.status(500).send('DB 오류');
  }
});

module.exports = router;