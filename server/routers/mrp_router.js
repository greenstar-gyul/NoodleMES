const express = require('express');
const router = express.Router();

const mrpService = require('../services/mrp_service.js');

// mrp 전체 조회
router.get('/all', async (req, res)=>{
    let mrpList = await mrpService.findAll()
                                  .catch(err => console.log(err));
    res.send(mrpList); 
});

module.exports = router;