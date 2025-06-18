const express = require('express');
const router = express.Router();

// 서비스 함수들 import
const { findAll, insertQlt, insertQcrTx } = require('../services/qlt_service');

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

module.exports = router;
