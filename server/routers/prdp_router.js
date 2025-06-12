const express = require('express');
 // Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

 // 해당 라우터를 통해 제공할 서비스를 가져옴
const prdpService = require('../services/prdp_service.js');

// 라우팅  = 사용자의 요청(URL+METHOD) + Service + 응답형태(View or Data)
// 실제 라우팅 등록 영역

// 전체조회 : 자원(데이터) -> books / 조회 -> GET
router.get('/all', async (req, res)=>{
    let prdpList = await prdpService.findAll()
                                    .catch(err => console.log(err));
    res.send(prdpList); 
});

// 해당하는 달 조회
router.get('/selectMonth', async (req, res)=>{
    let monthList = await prdpService.selectMonth()
                                    .catch(err => console.log(err));
    res.send(monthList); 
});
// 라인전체조회
router.get('/line', async (req, res)=>{
    let lineList = await prdpService.findLine()
                                    .catch(err => console.log(err));
    res.send(lineList); 
});

// 제품전체조회
router.get('/product', async (req, res)=>{
    let prodList = await prdpService.findProd()
                                    .catch(err => console.log(err));
    res.send(prodList); 
});


// 특정 계획의 상세 목록 조회
router.get('/detail/one', async (req, res) => {
  try {
    const prdpCode = req.query.prdp_code;
    const result = await prdpService.findDetail(prdpCode);
    res.json(result);
  } catch (err) {
    console.error('상세 데이터 조회 실패:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 3. 생산계획 등록
router.post('/', async (req, res) => {
  try{
    const { production, details } = req.body;
    const datas = {
      prdpData: production,
      detailData: details
    }
    const result = await prdpService.insertProductionTx(datas)
    res.json({ success: true, data: result });
  }catch (error){
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. 생산계획 수정
router.put('/:prdpcode', async (req, res) => {
  try{
    const { production, details } = req.body;
    production.prdp_code = req.params.prdpcode;

    const datas = {
      prdpData: production,
      detailData: details
    }
    
    const result = await prdpService.updateProductionTx(datas)
    res.json({ success: true, data: result });
  }catch (error){
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. 생산계획 삭제 (기본정보 + 상세정보 같이 삭제)
router.delete('/:prdpCode', async (req, res) => {
  try {
    const prdpCode = req.params.prdpCode;

    await prdpService.deleteProductionTx(prdpCode); // 트랜잭션으로 한번에 처리

    res.json({ success: true, message: '생산계획 삭제 완료' });
  } catch (err) {
    console.error("생산계획 삭제 실패:", err);
    res.status(500).json({ success: false, message: '삭제 중 오류 발생', error: err.message });
  }
});

router.get('/search', async (req, res) => {
  console.log('[search] 요청 쿼리:', req.query);  // 요청 데이터 로그

  try {
    const data = await prdpService.searchPrdp(req.query);
    res.json({ success: true, data });
  } catch (err) {
    console.error('❌ 검색 오류 발생:', err.message);
    console.error(err.stack);

    // 클라이언트에게도 에러 메시지와 상세 내용 전달 (개발용)
    res.status(500).json({
      success: false,
      message: '검색 실패',
      error: err.message
    });
  }
});


// 해당 javascript 파일의 마지막 코드, 모듈화
// 위에 선언한 기능(변수, 함수 등)들 중 외부로 노출할 대상을 설정 
// => 다른 파일에서 require()을 통해 가져옴
module.exports = router;