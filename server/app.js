// env 파일을 읽어들이는 코드 => 가능한 가장 첫번쨰 줄에 작성
require('dotenv').config({ path: './database/configs/dbConfig.env' });

const PORT = 3721;

const express = require('express');
const http = require('http');
const NoodleServer = require('./noodle-io/noodle_server.js'); // 웹 소켓 클래스

const app = express();

// HTTP 서버 생성 (Express와 WebSocket이 같은 포트를 사용하도록)
const server = http.createServer(app);

// 🚀 웹소켓 서버 생성 및 연결
const noodleServer = new NoodleServer();
noodleServer.create(server);

// 미들웨어 등록 영역
// 1. body parser
// content-type : application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// content-type : application/json
app.use(express.json());

// app.listen(PORT, () => {
//   console.log('server start');
// })

// Server 실행 (HTTP와 WebSocket 모두)
server.listen(PORT, () => {
  console.log('🚀 Server Start');
  console.log(`🌐 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`);
  console.log(`📊 WebSocket Status: http://localhost:${PORT}/api/websocket/status`);
});

// 라우팅 등록 영역
const deptRouter = require('./routers/dept_router.js');
const prdpRouter = require('./routers/prdp_router.js');
const mrpRouter = require('./routers/mrp_router.js');
const eqRouter = require('./routers/eq_router.js');
const eqichkRouter = require('./routers/eqichk_router.js');
const orderRouter = require('./routers/order_router.js');
const mprRouter = require('./routers/mpr_router.js');
const bomRouter = require('./routers/bom_router.js');
const lineRouter = require('./routers/line_router.js');
const wkoRouter = require('./routers/wko_router.js');
const prdrRouter = require('./routers/prdr_router.js');
const procRouter = require('./routers/proc_router.js');
const workRouter = require('./routers/work_router.js');
const qrcRouter = require('./routers/qcr_router.js');
const qcrRouter = require('./routers/qcr_router.js');
const qltRouter = require('./routers/qlt_router.js');

// 기본 라우팅
/*
app.get('/', (req, res) => {
  res.send('Welcome!!');
})*/
// 라우터 모듈 등록
app.use('/api/dept', deptRouter);
app.use('/api/prdp', prdpRouter);
app.use('/api/mrp', mrpRouter);
app.use('/api/eq', eqRouter);
app.use('/api/eqichk', eqichkRouter);
app.use('/api/order', orderRouter);
app.use('/api/mpr', mprRouter);
app.use('/api/qcr', qcrRouter);
app.use('/api/bom',bomRouter);
app.use('/api/line',lineRouter);
app.use('/api/wko', wkoRouter);
app.use('/api/prdr', prdrRouter);
app.use('/api/proc', procRouter);
app.use('/api/work', workRouter);
app.use('/api/qrc', qrcRouter);
app.use('/api/qlt', qltRouter);


// vue.js build 이후
const path = require('path');
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});


app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "./public", "index.html"));
});


// 서버 종료 시 웹소켓 정리
process.on('SIGTERM', () => {
  // console.log('🔌 웹소켓 서버 종료 중...');
  wss.close(() => {
    // console.log('✅ 웹소켓 서버 종료 완료');
    process.exit(0);
  });
});
