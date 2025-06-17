const express = require('express');
const router = express.Router();

const workService = require('../services/work_service.js');

// 작업지시서 전체 조회
router.get('/all', async (req, res) => {
    try {
        const wkoList = await wkoService.findAll();
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

module.exports = router;