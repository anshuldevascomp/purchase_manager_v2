const express = require('express');
const router = express.Router();
// const { login,sendOtp,verifyOtp } = require('../controllers/auth.controller');
const {saveMaster,updateMaster,resturantLinkage} = require('../controllers/master.controller');

router.post('/savemaster', saveMaster);
router.put('/savemaster/:id', updateMaster);
router.put('/saveResturantLinkage/:id', resturantLinkage);

module.exports = router;
