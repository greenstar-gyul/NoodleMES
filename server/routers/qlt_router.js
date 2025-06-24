const express = require('express');
const router = express.Router();

// 서비스 함수들 import
const { findAll, insertQlt, insertQcrTx } = require('../services/qlt_service');
qltService = require('../services/qlt_service');

// 라우팅  = 사용자의 요청(URL+METHOD) + Service + 응답형태(View or Data)
// 실제 라우팅 등록 영역

// 전체조회 : 자원(데이터) -> books / 조회 -> GET
router.get('/search', async (req, res) => {
  // 해당 엔드포인트(URL+METHOD)로 접속할 경우 제공되는 서비스를 실행
  // -> 서비스가 DB에 접속하므로 비동기 작업, await/async를 활용해서 동기식으로 동작하도록 진행
  let data = req.query;
  let qltList = await qltService.findAll()
    .catch(err => console.log(err));

  // res(Http Response에 대응되는 변수)의 응답메소드를 호출해 데이터를 반환하거나 통신을 종료함 
  // 주의사항) res(Http Response에 대응되는 변수)의 응답메소드를 호출하지 않으면 통신이 종료되지 않음                   
  // res.send()는 데이터를 반환하는 응답 메소드며 객체로 반환되므로 JSON으로 자동 변환
  res.send(qltList);
});

// 전체 품질 기준 조회
router.get('/all', async (req, res) => {
  try {
    const result = await findAll();
    res.status(200).json(result);
  } catch (err) {
    console.error('❌ 품질 기준 전체 조회 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.get(`/qio/qcr`, async (req, res) => {
  try {
    const qcrList = await qltService.getQcrList();
    res.json({ success: true, data: qcrList });
  } catch (error) {
    console.error('품질 기준 조회 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 품질 기준 등록
router.post('/register', async (req, res) => {
  try {
    const qcrDataList = req.body;

    console.log('📦 받은 데이터:', qcrDataList);

    // if (!Array.isArray(qcrDataList) || qcrDataList.length === 0) {
    //   return res.status(400).json({ success: false, message: '유효하지 않은 데이터입니다.' });
    // }

    const result = await insertQcrTx(qcrDataList);
    res.status(200).json({ success: true, qcr_codes: result.qcr_codes });
  } catch (err) {
    console.error('❌ 품질 기준 등록 API 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});
// 해당 javascript 파일의 마지막 코드, 모듈화
// 위에 선언한 기능(변수, 함수 등)들 중 외부로 노출할 대상을 설정 
// => 다른 파일에서 require()을 통해 가져옴

router.get('/qio/search', async (req, res) => {
  try {
    const { 
      qio_code, 
      prdr_code, 
      mpr_d_code, 
      emp_name, 
      start_date, 
      end_date, 
      insp_start_date, 
      insp_end_date 
    } = req.query;

    console.log('🔍 검색 조건:', req.query);

    // 전체 데이터 먼저 조회
    let qioList = await qltService.getQioList();
    
    // 클라이언트 사이드 필터링 적용
    let filteredData = qioList;

    if (qio_code) {
      filteredData = filteredData.filter(item => 
        item.qio_code && item.qio_code.includes(qio_code)
      );
    }

    if (prdr_code && prdr_code !== '해당없음') {
      filteredData = filteredData.filter(item => 
        item.prdr_code && item.prdr_code.includes(prdr_code)
      );
    }

    if (mpr_d_code && mpr_d_code !== '해당없음') {
      filteredData = filteredData.filter(item => 
        item.mpr_d_code && item.mpr_d_code.includes(mpr_d_code)
      );
    }

    if (emp_name) {
      filteredData = filteredData.filter(item => 
        item.emp_name && item.emp_name.includes(emp_name)
      );
    }

    // 🔥 날짜 변환 함수 추가!
    const formatDateForComparison = (dateValue) => {
      if (!dateValue) return null;
      
      // Date 객체인 경우
      if (dateValue instanceof Date) {
        return dateValue.toISOString().substring(0, 10);
      }
      
      // 문자열인 경우
      if (typeof dateValue === 'string') {
        return dateValue.substring(0, 10);
      }
      
      // 그 외의 경우 null 반환
      return null;
    };

    // 🔥 날짜 비교 수정! (qio_date)
    if (start_date) {
      filteredData = filteredData.filter(item => {
        const itemDate = formatDateForComparison(item.qio_date);
        return itemDate && itemDate >= start_date;
      });
    }

    if (end_date) {
      filteredData = filteredData.filter(item => {
        const itemDate = formatDateForComparison(item.qio_date);
        return itemDate && itemDate <= end_date;
      });
    }

    // 🔥 날짜 비교 수정! (insp_date)
    if (insp_start_date) {
      filteredData = filteredData.filter(item => {
        const itemDate = formatDateForComparison(item.insp_date);
        return itemDate && itemDate >= insp_start_date;
      });
    }

    if (insp_end_date) {
      filteredData = filteredData.filter(item => {
        const itemDate = formatDateForComparison(item.insp_date);
        return itemDate && itemDate <= insp_end_date;
      });
    }

    console.log(`🎯 검색 결과: ${filteredData.length}건`);

    res.json({
      success: true,
      data: filteredData,
      count: filteredData.length,
      message: `${filteredData.length}건 조회 완료`
    });

  } catch (error) {
    console.error('❌ QIO 검색 실패:', error);
    res.status(500).json({
      success: false,
      message: '검색 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

router.get('/qio/:code', async (req, res) => {
  try {
    const qioCode = req.params.code;
    const qioData = await qltService.searchQioListByCode(qioCode);
    if (qioData.length > 0) {
      res.json({ success: true, data: qioData[0] });
    } else {
      res.status(404).json({ success: false, message: 'QIO 코드가 존재하지 않습니다.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/qio', async (req, res) => {
  try {
    let qioList = await qltService.getQioList();
    res.send(qioList);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: '조회 실패' });
  }
});

router.get('/qio/prdr/:qioCode', async (req, res) => {
  try {
    const qioCode = req.params.qioCode;
    const prdrList = await qltService.searchPrdrListByQioCode(qioCode);
    res.json({ success: true, data: prdrList });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get(`/qio/mpr/:qioCode`, async (req, res) => {
  try {
    const qioCode = req.params.qioCode;
    const mprList = await qltService.searchMprListByQioCode(qioCode);
    res.json({ success: true, data: mprList });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/qio', async (req, res) => {
  try {
    const qioData = req.body;
    const result = await qltService.insertQio(qioData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('품질 검사 등록 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});


// selectSimpleQir에 대한 라우터
router.get('/qir/simple', async (req, res) => {
  try {
    const qirList = await qltService.selectSimpleQir();
    res.status(200).json({ success: true, data: qirList });
  } catch (error) {
    console.error('품질 검사 결과 간단 조회 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

//selectSimpleQirByQioCode에 대한 라우터
router.get('/qir/simple/:qioCode', async (req, res) => {
  try {
    const qioCode = req.params.qioCode;
    const qirList = await qltService.selectSimpleQirByQioCode(qioCode);
    res.status(200).json({ success: true, data: qirList });
  } catch (error) {
    console.error('품질 검사 결과 간단 조회 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// glt_service.js 의 getQirInfo에 대한 라우터
router.get('/qir/:code', async (req, res) => {
  try {
    const qirCode = req.params.code;
    const qirInfo = await qltService.getQirInfo(qirCode);
    if (qirInfo) {
      res.status(200).json({ success: true, data: qirInfo });
    } else {
      res.status(404).json({
        success: false, message: '품질 검사 결과을 찾을 수 없습니다.'
      });
    }
  } catch (error) {
    console.error('품질 검사 결과 조회 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/qio/save-all', async (req, res) => {
  try {
    const { qioData, detailData } = req.body;
    const result = await qltService.saveQioWithResults(qioData, detailData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('품질 검사 일괄 저장 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.put('/qio/save-all/:code', async (req, res) => {
  try {
    const { qioData, detailData } = req.body;
    qioData.qio_code = req.params.code;
    const result = await qltService.saveQioWithResults(qioData, detailData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('품질 검사 일괄 수정 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.delete('/qio/:code', async (req, res) => {
  try {
    const qioCode = req.params.code;
    const result = await qltService.deleteQioWithResults(qioCode);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('품질 검사 일괄 삭제 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/qir', async (req, res) => {
  try {
    const qirData = req.body;
    const result = await qltService.insertQir(qirData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('QIR 등록 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// QIR 개별 수정 API (서버에 추가 필요)
router.put('/qir/:code', async (req, res) => {
  try {
    const qirCode = req.params.code;
    const qirData = { ...req.body, qir_code: qirCode };
    const result = await qltService.updateQir(qirData);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('QIR 수정 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// ✅ 특정 QIO 코드로 QIR 목록 조회 (가장 중요!)
router.get('/qir/by-qio/:qioCode', async (req, res) => {
  try {
    const qioCode = req.params.qioCode;
    console.log('🔍 QIO별 QIR 조회 요청:', qioCode);

    const qirList = await qltService.getQirListByQioCode(qioCode);

    res.status(200).json({
      success: true,
      data: qirList,
      message: `${qioCode}에 대한 QIR ${qirList.length}건 조회 완료`
    });
  } catch (error) {
    console.error('❌ QIO별 QIR 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: 'QIR 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// ✅ QIO 목록 조회 (팝업용)
router.get('/qio/list', async (req, res) => {
  try {
    console.log('🔍 QIO 팝업 목록 조회 요청');

    const qioList = await qltService.getQioListForPopup();

    res.status(200).json({
      success: true,
      data: qioList,
      message: `QIO ${qioList.length}건 조회 완료`
    });
  } catch (error) {
    console.error('❌ QIO 팝업 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: 'QIO 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// ✅ QIR 등록 시 QIO 코드 유효성 검증 강화 (기존 router.post('/qir') 수정)
router.post('/qir', async (req, res) => {
  try {
    const qirData = req.body;

    console.log('💾 QIR 등록 요청:', qirData);

    // ✅ 필수 값 검증
    if (!qirData.qio_code) {
      return res.status(400).json({
        success: false,
        message: '검사지시코드(QIO)가 필요합니다.'
      });
    }

    if (!qirData.inspection_item) {
      return res.status(400).json({
        success: false,
        message: '품질기준항목이 필요합니다.'
      });
    }

    if (!qirData.result) {
      return res.status(400).json({
        success: false,
        message: '검사결과가 필요합니다.'
      });
    }

    // ✅ QIO 코드 존재 여부 확인
    const qioExists = await qltService.searchQioListByCode(qirData.qio_code);
    if (!qioExists || qioExists.length === 0) {
      return res.status(400).json({
        success: false,
        message: '존재하지 않는 검사지시코드입니다.'
      });
    }

    const result = await qltService.insertQir(qirData);

    res.status(201).json({
      success: true,
      data: result,
      message: 'QIR 등록이 완료되었습니다.'
    });
  } catch (error) {
    console.error('❌ QIR 등록 실패:', error);
    res.status(500).json({
      success: false,
      message: 'QIR 등록 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// insertPinbnd의 라우터

router.post('/pinbnd', async (req, res) => {
  try {
    const pinbndData = req.body;

    console.log('📦 받은 데이터:', pinbndData);

    // 필수 값 검증
    if (!pinbndData.qtt || !pinbndData.pinbnd_date || !pinbndData.qir_code || !pinbndData.qir_emp_code || !pinbndData.prod_name) {
      return res.status(400).json({ success: false, message: '필수 값이 누락되었습니다.' });
    }

    // 품목 코드 조회
    const prodCode = await qltService.getProdCodeByName(pinbndData.prod_name);
    if (!prodCode) {
      return res.status(400).json({ success: false, message: '존재하지 않는 품목명입니다.' });
    }

    // 직원 코드 조회
    const empCode = await qltService.getEmpCodeByQirEmpCode(pinbndData.qir_emp_code);
    if (!empCode) {
      return res.status(400).json({ success: false, message: '존재하지 않는 직원 코드입니다.' });
    }

    // 완제품 등록
    const result = await qltService.insertPinbnd({
      ...pinbndData,
      mcode: empCode,
      prod_code: prodCode
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('❌ 완제품 등록 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;