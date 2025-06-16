const express = require('express');
 // Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const procService = require('../services/proc_service.js');

// 제품 목록 조회
router.get('/product', async (req, res) => {
  try {
    const prodList = await procService.selectProdList();
    res.send(prodList);
  } catch (err) {
    console.error('❌ 제품 목록 조회 에러:', err);
    res.status(500).send({ message: '제품 목록 조회 중 오류 발생' });
  }
});



module.exports = router;