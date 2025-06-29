const express = require('express');
 // Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const lineService = require('../services/line_service.js');


// 라인 전체 조회
router.get('/list', async (req, res) => {
  try {
    const list = await lineService.getLineList();
    res.send(list);
  } catch (err) {
    res.status(500).send('라인 목록 조회 실패');
  }
});

// Line 검색 목록 라우터
router.get('/search', async (req, res) => {
  try {
    const searchParams = req.query; // 프론트에서 넘어온 검색조건들
    const result = await lineService.searchLineList(searchParams);
    res.json(result);
  } catch (err) {
    console.error('Line 검색 목록 라우터 에러:', err);
    res.status(500).send('서버 오류');
  }
});

// 공정 흐름 리스트  팝업
router.get('/process-popup', async (req, res) => {
  try {
    const result = await lineService.getProcessListPopup();
    res.json(result);
  } catch (err) {
    console.error('❌ 공정 팝업 라우터 에러:', err);
    res.status(500).send('서버 오류');
  }
});

// 설비 리스트  팝업
router.get('/facilitie-popup/:eqtype', async (req, res) => {
  try {
    const eqType = req.params.eqtype; // URL 파라미터에서 eqtype 가져오기
    const result = await lineService.getFacilitieListPopup(eqType);
    res.json(result);
  } catch (err) {
    console.error('❌ 공정 팝업 라우터 에러:', err);
    res.status(500).send('서버 오류'); 
  }
});

// 🔽 라인 + 라인상세 등록
router.post('/register', async (req, res) => {
  try {
    const data = req.body;

    const result = await lineService.insertLineAndLineD(data);

    res.status(201).json({
      message: '라인 등록 성공',
      line_code: result.line_code,
      line_eq_code: result.line_eq_code,
    });
  } catch (err) {
    console.error('❌ 라인 등록 실패:', err);
    res.status(500).json({ message: '라인 등록 중 오류 발생' });
  }
});

// ✅ 셀렉트 박스 선택시 상세 조회
router.get('/detail', async (req, res) => {
  const { line_code } = req.query; 

  if (!line_code) {
    return res.status(400).json({ message: 'line_code is required' });
  }

  try {
    const result = await lineService.findLineOne(line_code);
    res.json(result);
  } catch (err) {
    console.error('라인 단건 조회 실패:', err);
    res.status(500).json({ message: '조회 실패', error: err });
  }
});

// 제품 목록 조회
router.get('/product', async (req, res) => {
  try {
    const prodList = await lineService.selectProdList();
    res.send(prodList);
  } catch (err) {
    console.error('❌ 제품 목록 조회 에러:', err);
    res.status(500).send({ message: '제품 목록 조회 중 오류 발생' });
  }
});

// 제품 선택 시 해당 제품의 공정 흐름도 상세 목록 조회
router.get('/equipment', async (req, res) => {
  const { prod_code } = req.query;
   console.log('🔍 설비 조회 요청 prod_code:', prod_code); // ✅ 요청 값 로그
  try {
    const detailList = await lineService.getProdProcessDetail(prod_code);
    console.log('✅ 조회된 공정목록:', detailList); // ✅ 조회 결과 로그
    res.send(detailList);
  } catch (err) {
    console.error('❌ 라인 설비 구성 조회 에러:', err);
    res.status(500).send('DB 조회 오류');
  }
});

module.exports = router;
