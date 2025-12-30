const express = require('express');
const router = express.Router();
// const { login,sendOtp,verifyOtp } = require('../controllers/auth.controller');

router.post('/getPointsData', login);

module.exports = router;
