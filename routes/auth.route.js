const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const {verifyConfirmToken, verifyAccessToken, verifyResetToken} = require('../helpers/jwt_helper')

router.post('/register', userController.register);

router.post('/login', userController.login);

router.post('/refresh-token', userController.refreshToken);

router.delete('/logout', async (req, res, next) => {
  res.send('logout route');
});

router.get('/verify-email', verifyConfirmToken, userController.confirmEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', verifyResetToken, userController.resetPassword);

router.get('/my-account', verifyAccessToken, userController.getUserAccount);

router.post('/my-account/update', verifyAccessToken, userController.updateUserAccount);
router.post('/my-account/update-payment-gateway', verifyAccessToken, userController.updateUserPaymentGateway);

router.post('/user/contact-user', userController.contactUser);

router.get('/users', userController.getUsers);
router.get('/single-user/:id', userController.getSingleUser)
router.get('/user-items', userController.getUserItems);

router.post('/subscribe', userController.subscribe);

// for testing sendign emails
router.post('/sendemail', userController.sendEmail);


module.exports = router;