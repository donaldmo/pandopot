const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');
const { verifyAccessToken } = require('../helpers/jwt_helper');

router.post('/add-market', verifyAccessToken, marketController.addMarket);
router.put('/edit-market', verifyAccessToken, marketController.editMarket);

router.get('/get-user-markets', verifyAccessToken, marketController.getUserMarkets);

router.get('/get-markets', marketController.getMarkets);
router.get('/get-market/:id', marketController.getSingleMarket);
router.get('/category', marketController.getMarketsByCategory);

router.put('/update-market', verifyAccessToken,marketController.updateMarket);
router.delete('/delete-market/:id', verifyAccessToken, marketController.deleteMarket);

module.exports = router; 