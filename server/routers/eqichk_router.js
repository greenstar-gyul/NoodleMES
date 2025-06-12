const express = require('express');
const router = express.Router();

const eqichkService = require('../services/eqichk_service.js');

// 전체 조회
router.get('/all', async (req, res) => {
    try {
        let eqichkList = await eqichkService.findAll();
        res.send(eqichkList);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: '조회 실패' });
    }
});

// 검색 조회
router.get('/search', async (req, res) => {
    console.log('[eqichk search] 요청 쿼리:', req.query);  // 요청 데이터 로그

    try {
        const data = await eqichkService.searchEqChkType(req.query);
        res.json({ success: true, data });
    } catch (err) {
        console.error('eqichk 검색 오류 발생:', err.message);
        console.error(err.stack);

        // 클라이언트에게도 에러 메시지와 상세 내용 전달 (개발용)
        res.status(500).json({
            success: false,
            message: '검색 실패',
            error: err.message
        });
    }
});

// 특정 코드로 조회
router.get('/:code', async (req, res) => {
    try {
        const result = await eqichkService.findByCode(req.params.code);
        if (result) {
            res.json({ success: true, data: result });
        } else {
            res.status(404).json({ success: false, error: '데이터를 찾을 수 없습니다' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 등록
router.post('/', async (req, res) => {
    try {
        const result = await eqichkService.insertEqiChkType(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 수정
router.put('/:code', async (req, res) => {
    try {
        const result = await eqichkService.updateEqiChkType(req.params.code, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 삭제
router.delete('/:code', async (req, res) => {
    try {
        const result = await eqichkService.deleteEqiChkType(req.params.code);
        res.json({ success: true, data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 다중 삭제
router.delete('/multiple/delete', async (req, res) => {
    try {
        const { codes } = req.body; // 배열로 받기
        if (!codes || !Array.isArray(codes) || codes.length === 0) {
            return res.status(400).json({ success: false, error: '삭제할 코드가 없습니다' });
        }

        const result = await eqichkService.deleteMultiple(codes);
        res.json({ success: true, data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;