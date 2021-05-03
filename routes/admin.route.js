const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyAccessToken } = require('../helpers/jwt_helper');

router.get('/', verifyAccessToken, adminController.getAdminAccount);

router.get('/packages', adminController.getAllPackages); //done
router.post('/package', adminController.getPackage);

router.post('/get-package', verifyAccessToken, adminController.getAdminPackage);
router.post('/get-packages', verifyAccessToken, adminController.getAdminPackages);

router.post('/add-package', verifyAccessToken, adminController.addPackage);
router.put('/edit-package', verifyAccessToken, adminController.editPackage);
router.delete('/delete-package/:id', verifyAccessToken, adminController.deletePackage);

router.get('/categories', adminController.getAllCategories);
router.get('/category/:id', adminController.getCategory);

router.get('/get-categories', verifyAccessToken, adminController.getAdminCategories);
router.post('/get-category', verifyAccessToken, adminController.getAdminCategory);
router.put('/edit-category', verifyAccessToken, adminController.editAdminCategory);

router.delete('/delete-category/:id', verifyAccessToken, adminController.deleteCategory);

router.post('/add-categories', verifyAccessToken, adminController.addCategories);
router.post('/add-admin-payment-gateway', verifyAccessToken, adminController.addAdminPaymentGateway);
router.get('/get-payment-gateway', verifyAccessToken, adminController.getPaymentGateway);
router.get('/payment-gateway', adminController.getShopPaymentGateway);

router.get('/get-users', verifyAccessToken, adminController.getUsers);
router.get('/get-user/:id', verifyAccessToken, adminController.getUser);
router.post('/set-user-admin', verifyAccessToken, adminController.setUserAsAdmin);
router.post('/unset-user-admin', verifyAccessToken, adminController.unsetUserAdmin);

router.get('/boostings', adminController.getBoostings);
router.get('/get-boosting/:id', verifyAccessToken, adminController.getBoosting);
router.post('/add-boosting', verifyAccessToken, adminController.addBoosting);
router.delete('/delete-boosting/:id', verifyAccessToken, adminController.addBoosting);
router.put('/edit-boosting/', verifyAccessToken, adminController.editBoosting);

router.post('/add-terms', verifyAccessToken, adminController.addTerms);
router.get('/get-terms', verifyAccessToken, adminController.getTerms);
router.get('/terms', adminController.getStoreTerms);
router.put('/edit-terms/:id', verifyAccessToken, adminController.editTerms);

router.post('/add-post', verifyAccessToken, adminController.addPost);
router.get('/get-posts', verifyAccessToken, adminController.getAdminPosts);
router.get('/get-post/:id', verifyAccessToken, adminController.getAdminPost);
router.get('/posts', adminController.getStorePosts);
router.get('/single-post', adminController.getStorePost);
router.put('/edit-post/:id', verifyAccessToken, adminController.editPost);
router.delete('/delete-post/:id', verifyAccessToken, adminController.deletePost);

module.exports = router; 