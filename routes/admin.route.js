const express = require('express');
const router = express.Router();
const unitController = require('../controller/unit.controller');
const addressController = require('../controller/address.controller');
const pointCalculatorControler = require('../controller/pointCalculator.controller');
const subCategoryController = require('../controller/subCategory.controller');
const categoryController = require('../controller/category.controller');
const productController = require('../controller/product.controller');
const itemController = require('../controller/item.controller');
const userController = require('../controller/user.controller');


/* products Routes */
router.get('/products', productController.findAll);
router.post('/products', productController.insert);
router.put('/products/', productController.updateById);
router.get('/products/:id', productController.findById);
router.delete('/products/:id', productController.removeById);

/* items Routes */
router.get('/items', itemController.findAll);
router.post('/items', itemController.insert);
router.put('/items/', itemController.updateById);
router.get('/items/:id', itemController.findById);
router.get('/items/product/:id', itemController.findByProductId);
router.delete('/items/:id', itemController.removeById);


/* units Routes */
router.get('/units', unitController.findAll);
router.post('/units', unitController.insert);
router.put('/units/', unitController.updateById);
router.get('/units/:id', unitController.findById);
router.delete('/units/:id', unitController.removeById);

/* Category Routes*/
router.get('/categories', categoryController.findAll);
router.post('/categories', categoryController.insert);
router.put('/categories/', categoryController.updateById);
router.get('/categories/:id', categoryController.findById);
router.delete('/categories/:id', categoryController.removeById);

/* SubCategory Routes*/
router.get('/sub-categories', subCategoryController.findAll);
router.post('/sub-categories', subCategoryController.insert);
router.put('/sub-categories/', subCategoryController.updateById);
router.get('/sub-categories/:id', subCategoryController.findById);
router.get('/sub-categories/category/:id', subCategoryController.findByCategoryId);
router.delete('/sub-categories/:id', subCategoryController.removeById);

/* Shipping Address Routes*/
router.get('/address', addressController.findAll);
router.post('/address', addressController.insert);
router.put('/address/', addressController.updateById);
router.get('/address/:id', addressController.findById);
router.delete('/address/:id', addressController.removeById);

/* Point calculator Routes*/
router.get('/point-calculator', pointCalculatorControler.findAll);
router.post('/point-calculator', pointCalculatorControler.insert);
router.put('/point-calculator', pointCalculatorControler.updateById);
router.get('/point-calculator/:id', pointCalculatorControler.findById);
router.delete('/point-calculator/:id', pointCalculatorControler.removeById);

//user Routes
router.get('/users', userController.findAll);
router.post('/users', userController.insert);
router.get('/users/:id', userController.findById);
router.delete('/users/:id', userController.removeById);
router.put('/users', userController.updateById);
router.put('/users/addCart', userController.addToCart);




module.exports = router;