// env 파일을 읽어들이는 코드 => 가능한 가장 첫번쨰 줄에 작성
require('dotenv').config({ path: './database/configs/dbConfig.env' });

const PORT = 3721;

const express = require('express');
const app = express();
// 미들웨어 등록 영역
// 1. body parser
// content-type : application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// content-type : application/json
app.use(express.json());

// Server 실행 
app.listen(PORT, () => {
  console.log('Server Start');
  console.log(`http://localhost:${PORT}`);
})

// 라우팅 등록 영역
const deptRouter = require('./routers/dept_router.js');

const prdpRouter = require('./routers/prdp_router.js')

const mrpRouter = require('./routers/mrp_router.js');

const orderRouter = require('./routers/order_router.js');

const mprRouter = require('./routers/mpr_router.js');


// 기본 라우팅
app.get('/', (req, res) => {
  res.send('Welcome!!');
})
// 라우터 모듈 등록
app.use('/dept', deptRouter);
app.use('/prdp', prdpRouter);
app.use('/mrp', mrpRouter);
app.use('/order', orderRouter);
app.use('/mpr', mprRouter);

