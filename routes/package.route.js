const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');
const { verifyAccessToken } = require('../helpers/jwt_helper');

router.get('/packages', verifyAccessToken, packageController.getAllPackages);
router.post('/package', verifyAccessToken, packageController.getPackage);
router.post('/buy-package', verifyAccessToken, packageController.buyPackage);

module.exports = router; 