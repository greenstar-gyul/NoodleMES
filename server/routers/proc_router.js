const express = require('express');
 // Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const procService = require('../services/proc_service.js');

// 제품 목록 조회 완제품기준
router.get('/product', async (req, res) => {
  try {
    const prodList = await procService.selectProdList();
    res.send(prodList);
  } catch (err) {
    console.error('❌ 제품 목록 조회 에러:', err);
    res.status(500).send({ message: '제품 목록 조회 중 오류 발생' });
  }
});

// 제품공정흐름도 목록조회
router.get('/list', async (req, res) => {
  try {
    const list = await procService.getProcList();
    res.send(list);
  } catch (err) {
    console.error('❌ 제품공정흐름도 조회 중 에러:', err);
    res.status(500).send('제품공정흐름도 조회 실패');
  }
});

// 제품공정흐름도 상세 조회
router.get('/detail', async (req, res) => {
  const { prod_proc_code } = req.query;
  if (!prod_proc_code) return res.status(400).send('prod_proc_code가 필요합니다');

  try {
    const result = await procService.getProcFullOne(prod_proc_code);
    res.send(result);
  } catch (err) {
    res.status(500).send('공정 흐름도 전체 조회 중 오류');
  }
});

// 제품공정흐름도 목록 조건 검색 
// 제품 공정흐름도 검색
router.get('/search', async (req, res) => {
  try {
    const {
      prod_proc_code,
      po_name,
      prod_code,
      prod_name,
      reg_date_from,
      reg_date_to
    } = req.query;

    const searchParams = {
      prod_proc_code,
      po_name,
      prod_code,
      prod_name,
      reg_date_from,
      reg_date_to
    };

    const result = await procService.searchProcList(searchParams);
    res.send(result);
  } catch (err) {
    console.error('❌ 제품 공정흐름도 검색 에러:', err);
    res.status(500).send('검색 중 서버 오류 발생');
  }
});

// 공정 목록 조회 팝업 
router.get('/process-popup', async (req, res) => {
  try {
    const processList = await procService.selectprocessListPopup();
    res.send(processList);
  } catch (err) {
    console.error('❌ 공정 목록 조회 에러:', err);
    res.status(500).send({ message: '공정 목록 조회 중 오류 발생' });
  }
});
// 설비 유형 조회 팝업 
router.get('/eqType-popup', async (req, res) => {
  try {
    const eqTypeList = await procService.selecteqTypeListPopup();
    res.send(eqTypeList);
  } catch (err) {
    console.error('❌ 설비 유형 조회 에러:', err);
    res.status(500).send({ message: '설비 유형 조회 중 오류 발생' });
  }
});

// 제품 공정 흐름도 등록
router.post('/register', async (req, res) => {
  try {
    const result = await procService.insertPorcDetailTx(req.body); // 클라이언트에서 보낸 데이터 처리
    res.send(result); // ex: { success: true, proc_code: 'PROC-0007' }
  } catch (err) {
    console.error('❌ 등록 실패:', err);
    res.status(500).send('공정 흐름도 등록 실패');
  }
});

module.exports = router;