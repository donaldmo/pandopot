const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { verifyAccessToken } = require('../helpers/jwt_helper');

router.get('/get-subscriptions', verifyAccessToken, subscriptionController.getSubscriptions);
router.get('/get-subscription/:id', verifyAccessToken, subscriptionController.getSubscription);
router.delete('/delete/:id', verifyAccessToken, subscriptionController.deleteSubscription);

module.exports = router;