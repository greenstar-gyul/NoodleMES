const express = require('express');
const router = express.Router();

const mrpService = require('../services/mrp_service.js');

// mrp 전체 조회
router.get('/all', async (req, res) => {
    try {
        const mrpList = await mrpService.findAll();
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": mrpList
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

// mrp 상세 전체 조회
router.get('/detail-all', async (req, res) => {
    try {
        const mrpDetailList = await mrpService.findDetailsAll();
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": mrpDetailList
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

// 생산 계획 조회 팝업
router.get('/plan-list', async (req, res) => {
    try {
        const prodPlanList = await mrpService.findPlansAll();
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": prodPlanList
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

// 자재 목록 불러오기
router.get('/matlist', async (req, res) => {
    try {
        const result = await mrpService.getMatList();
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": result
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

// MRP 초기 조회
router.get('/searchMonth', async (req, res) => {
    try {
        const data = await mrpService.searchMRPMonth(req.query);
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": data
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

// MRP 조회
router.get('/search', async (req, res) => {
    try {
        const data = await mrpService.searchMRPByOptions(req.query);
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": data
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

// 자재 추가 팝업 자재 검색
router.get('/search-mat', async (req, res) => {
    try {
        const matName = req.query.mat_name;
        const data = await mrpService.searchMat(matName);
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": data
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

// 생산 계획에 따른 MRP 코드
router.get('/mrpcode/:prdpCode', async (req, res) => {
    try {
        const prdpCode = req.params.prdpCode;
        const mrpCode = await mrpService.findMRPCode([prdpCode]);
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": mrpCode
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

// MRP 코드로 MRP 상세 조회
router.get('/detail/:mrpCode', async (req, res) => {
    try {
        const mrpCode = req.params.mrpCode;
        const mrpDetails = await mrpService.findMRPDetail(mrpCode);
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": mrpDetails
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

// MRP 코드로 MRP 상세 조회
router.get('/sub-mat/:prdpCode', async (req, res) => {
    try {
        const prdpCode = req.params.prdpCode;
        const matList = await mrpService.findMatByBom([prdpCode]);
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": matList
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

// MRP 코드로 MRP 조회
router.get('/:mrpCode', async (req, res) => {
    try {
        const mrpCode = req.params.mrpCode;
        const mrp = await mrpService.findMRP([mrpCode]);
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": mrp
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

// MRP 신규 등록
router.post('/create', async (req, res) => {
    try {
        const data = req.body;
        const result = await mrpService.insertMRPTx(data);
        
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": result
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

// MRP 갱신
router.put('/:mrpCode', async (req, res) => {
    try {
        const data = req.body;
        const result = await mrpService.modifyMRPTx(data);
        
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": result
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