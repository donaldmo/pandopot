const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const adminControllr = require('../controllers/admin.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper');

router.get('/categories', adminControllr.getAllCategories);

router.get('/get-products', shopController.getProducts);
router.get('/get-product/:id', shopController.getProduct);
router.get('/get-category-products', shopController.getCategoryProducts);

router.post('/add-cart', verifyAccessToken, shopController.addToCart);
router.post('/update-cart', verifyAccessToken, shopController.updateCart);
router.delete('/delete-cart-item/:id', verifyAccessToken, shopController.deleteCartItem);

router.get('/get-cart', verifyAccessToken, shopController.getCart);
router.get('/get-cart-item/:id', verifyAccessToken, shopController.getCartItem);

router.post('/checkout', verifyAccessToken, shopController.buyProduct);

router.get('/get-orders', verifyAccessToken, shopController.getOrders);
router.get('/get-order-item/:id', verifyAccessToken, shopController.getOrderItem);

router.get('/get-orders', verifyAccessToken, shopController.getOrderedProducts);
router.get('/get-customers-oders', verifyAccessToken, shopController.getCustomerOrders);
router.get('/get-customer-single-order/:id', verifyAccessToken, shopController.getCustomerSingleOrder);

router.get('/search', shopController.search);

router.get('/boosted-products/:boostName', shopController.getBoostedProducts);
router.post('/contact-us', shopController.contactUs);

// router.get('/store-product/:id', productController.getStoreProduct);
// router.post('/get-product', verifyAccessToken, productController.getUserProduct);
// router.post('/add-product', verifyAccessToken, fileController.upload, productController.addProduct);
// router.delete('/delete-product/:id', verifyAccessToken, productController.deleteProduct);
// router.put('/update-product', verifyAccessToken, productController.updateProduct);

module.exports = router; 