const express = require('express');
const router = express.Router();

// 서비스 함수 import
const {
  getAllInspectionOrders,
  getAllInspectionResults
} = require('../services/qc_service');

// 검사지시서 전체 조회
router.get('/all-orders', async (req, res) => {
  try {
    const result = await getAllInspectionOrders();
    res.status(200).json(result);
  } catch (err) {
    console.error('❌ 검사지시서 전체 조회 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 검사결과 전체 조회
router.get('/all-results', async (req, res) => {
  try {
    const result = await getAllInspectionResults();
    res.status(200).json(result);
  } catch (err) {
    console.error('❌ 검사결과 전체 조회 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
