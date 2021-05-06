const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const fileController = require('../controllers/file.controller');
const { verifyAccessToken } = require('../helpers/jwt_helper');

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
});

const uploadStorage = multer({ storage: storage });

router.get('/', productController.getProducts);
router.get('/store-product/:id', productController.getStoreProduct);

router.get('/get-products', verifyAccessToken, productController.getUserProducts);
router.post('/get-product', verifyAccessToken, productController.getUserProduct);

// fileController.upload,
router.post('/add-product', verifyAccessToken, productController.addProduct);

router.delete('/delete-product/:id', verifyAccessToken, productController.deleteProduct);
router.put('/update-product', verifyAccessToken, productController.updateProduct);

router.post('/boost-product', verifyAccessToken, productController.boostProduct);
router.get('/plants-types', productController.getPlantsTypes);

module.exports = router; 