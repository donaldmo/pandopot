const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const { verifyAccessToken } = require('../helpers/jwt_helper');

router.post('/upload', fileController.upload);
router.get('/files', fileController.getListFiles);
router.get('/files/:name', fileController.download);

module.exports = router; 