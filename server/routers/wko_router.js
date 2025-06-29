const express = require('express');
const router = express.Router();

const wkoService = require('../services/wko_service.js');

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

// 생산 계획 조회 팝업
router.get('/plan-list', async (req, res) => {
    try {
        const prodPlanList = await wkoService.findPlansAll();
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

// 제품 목록 불러오기(생산계획에 따른 제품 목록)
router.get('/prodlist', async (req, res) => {
    try {
        const prdpCode = req.query.prdp_code || '';
        // console.log('전달 받은 prdp_code:', prdpCode);
        const result = await wkoService.getProdList(prdpCode);
        // console.log('조회결과\n', result);
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

// 제품 목록 전체 불러오기
router.get('/prodall', async (req, res) => {
    try {
        const result = await wkoService.getProdAll();
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

// 제품 목록 검색 (생산 계획 연동 O)
router.get('/prodSearchByPrdp', async (req, res) => {
    try {
        const prdpCode = req.query.prdp_code || '';
        const prodName = req.query.prod_name || '';
        // console.log('전달 받은 prdp_code:', prdpCode);
        const result = await wkoService.getProdSearchByPrdp([prdpCode, prdpCode, prdpCode, prodName, prodName, prodName]);
        // console.log('조회결과\n', result);
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

// 제품 목록 검색 (생산 계획 연동 X)
router.get('/prodSearch', async (req, res) => {
    try {
        const prodName = req.query.prod_name || '';
        // console.log('전달 받은 prdp_code:', prdpCode);
        const result = await wkoService.getProdSearch([prodName, prodName, prodName]);
        // console.log('조회결과\n', result);
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


// 작업지시서 초기 조회 (최근 1달)
router.get('/searchMonth', async (req, res) => {
    try {
        const data = await wkoService.searchWKOMonth();
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

// 작업지시서 조회
router.get('/search', async (req, res) => {
    try {
        const data = await wkoService.searchWKOByOptions(req.query);
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

// 작업자 리스트 조회
router.get('/emp-list', async (req, res) => {
    try {
        let empName = req.query.emp_name || '';
        empName = empName.trim(); // 공백 제거

        const data = await wkoService.findEmpList(empName);
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

// 라인 리스트 조회
router.get('/line-list', async (req, res) => {
    try {
        const prodCode = req.query.prod_code || '';
        let lineName = req.query.line_name || '';
        lineName = lineName.trim()

        const data = await wkoService.findLineList([prodCode, lineName]);
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

// 라인 코드로 공정 목록 조회
router.get('/processes/:lineCode', async (req, res) => {
    try {
        const lineCode = req.params.lineCode;
        const processes = await wkoService.findWKOProcesses(lineCode);
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": processes
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

// 제품별 생산공정 조회 (참조용)
router.get('/prod-processes/:prodCode', async (req, res) => {
    try {
        const prodCode = req.params.prodCode;
        const processes = await wkoService.findProdProcesses(prodCode);
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": processes
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

// 작업지시서 코드로 작업지시서 조회
router.get('/:wkoCode', async (req, res) => {
    try {
        const wkoCode = req.params.wkoCode;
        const wko = await wkoService.findWKO([wkoCode]);
        res.status(200).json({
            "result_code": "SUCCESS",
            "message": "성공",
            "data": wko
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

// 작업지시서 신규 등록
router.post('/create', async (req, res) => {
    try {
        const data = req.body;
        const result = await wkoService.insertWKOTx(data);
        
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

// 작업지시서 갱신
router.put('/:wkoCode', async (req, res) => {
    try {
        const wkoCode = req.params.wkoCode;
        const data = req.body;
        const result = await wkoService.modifyWKO(wkoCode, data);
        
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

// 작업지시서 삭제
router.delete('/:wkoCode', async (req, res) => {
    try {
        const wkoCode = req.params.wkoCode;
        const result = await wkoService.deleteWKO(wkoCode);
        
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