const express = require('express');
const router = express.Router();
const { login,sendOtp,verifyOtp,sendOtpToAdmin,verifyOtpAdmin } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/sendOtp', sendOtp);
router.post('/verifyOtp', verifyOtp);
router.post('/sendOtpToAdmin', sendOtpToAdmin);
router.post('/verifyOtpAdmin', verifyOtpAdmin);

module.exports = router;
