const express = require('express');
const router = express.Router();
const {getImages,uploadImage,viewImage,termspdf,getpdf,uploadpdf,deletepdf} = require('../controllers/images.controller');

router.get('/getImages/:id', getImages);
router.get('/viewImage/:id', viewImage);
router.post('/uploadImage', uploadImage);
router.get('/getTextfile', termspdf);
router.get('/getresumepdf/:id', getpdf);
router.post('/uploadresumepdf', uploadpdf);
router.post('/deletepdf/:id', deletepdf);
module.exports = router;
