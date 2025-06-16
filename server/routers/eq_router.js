const express = require('express');
const router = express.Router();

const eqService = require('../services/eq_service.js');

// mrp 전체 조회
router.get('/all', async (req, res) => {
    try {
        let eqList = await eqService.findAll();
        res.send(eqList);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: '조회 실패' });
    }
});

router.get('/search', async (req, res) => {
    try {
        const searchParams = {
            eq_code: req.query.eq_code || '',
            eq_name: req.query.eq_name || '',
            eq_maker: req.query.eq_maker || '',
            is_used: req.query.is_used || ''
        };
        let eqList = await eqService.searchEquipment(searchParams);
        res.send(eqList);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: '검색 실패' });
    }
});

// 등록
router.post('/', async (req, res) => {
    try {
        const result = await eqService.insertEq(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 수정
router.put('/:code', async (req, res) => {
    try {
        const result = await eqService.updateEq(req.params.code, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 삭제
router.delete('/:code', async (req, res) => {
    try {
        const result = await eqService.deleteEq(req.params.code);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 다중 삭제
router.delete('/multiple/delete', async (req, res) => {
    try {
        const { codes } = req.body;
        if (!codes || !Array.isArray(codes) || codes.length === 0) {
            return res.status(400).json({ success: false, error: '삭제할 코드가 없습니다' });
        }

        const result = await eqService.deleteMultiple(codes);
        res.json({ success: true, data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 설비 점검 조회 팝업
router.get('/eqiiall', async (req, res) => {
    try {
        let eqiiList = await eqService.showEqii();
        res.send(eqiiList);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: '조회 실패' });
    }
})

// 점검결과 조회
router.get('/eqirall/:code', async (req, res) => {
    try {
        let eqirCode = req.params.code;
        let eqirList = await eqService.showEqir(eqirCode);
        res.send(eqirList);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: '조회 실패' });
    }
})

// 점검결과 조회
router.get('/eqitype/:type', async (req, res) => {
    try {
        let Type = req.params.type;
        let TypeList = await eqService.showEqiType(Type);
        res.send(TypeList);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: '조회 실패' });
    }
})

module.exports = router;