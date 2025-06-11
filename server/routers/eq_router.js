const express = require('express');
const router = express.Router();

const eqService = require('../services/eq_service.js');

// mrp 전체 조회
router.get('/all', async (req, res)=>{
    try {
      let eqList = await eqService.findAll();
      res.send(eqList);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error : '조회 실패'});
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

module.exports = router;