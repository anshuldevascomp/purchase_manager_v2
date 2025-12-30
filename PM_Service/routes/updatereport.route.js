const express = require('express');
const router = express.Router();
const { updateGreyPoints } = require('../controllers/updatereport.controller');

router.post('/updateGreyPoints', updateGreyPoints);

module.exports = router;