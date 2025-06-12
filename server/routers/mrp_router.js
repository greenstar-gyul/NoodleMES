const express = require('express');
const router = express.Router();

const mrpService = require('../services/mrp_service.js');

// mrp 전체 조회
router.get('/all', async (req, res) => {
    const mrpList = await mrpService.findAll()
        .catch(err => console.log(err));
    res.send(mrpList);
});

// mrp 상세 전체 조회
router.get('/detail-all', async (req, res) => {
    const mrpDetailList = await mrpService.findDetailsAll()
        .catch(err => console.log(err));
    res.send(mrpDetailList);
});

// 생산 계획 조회 팝업
router.get('/plan-list', async (req, res) => {
    const prodPlanList = await mrpService.findPlansAll()
        .catch(err => console.log(err));
    res.send(prodPlanList);
});

// 생산 계획에 따른 MRP 코드
router.get('/mrpcode/:prdpCode', async (req, res) => {
    const prdpCode = req.params.prdpCode;
    const mrpCode = await mrpService.findMRPCode([prdpCode])
        .catch(err => console.log(err));
    res.send(mrpCode);
});

// MRP 코드로 MRP 조회
router.get('/:mrpCode', async (req, res) => {
    const mrpCode = req.params.mrpCode;
    const mrp = await mrpService.findMRP([mrpCode])
        .catch(err => console.log(err));
    res.send(mrp);
});

// MRP 코드로 MRP 상세 조회
router.get('/detail/:mrpCode', async (req, res) => {
    const mrpCode = req.params.mrpCode;
    const mrpDetails = await mrpService.findMRPDetail(mrpCode)
        .catch(err => console.log(err));
    res.send(mrpDetails);
});

module.exports = router;