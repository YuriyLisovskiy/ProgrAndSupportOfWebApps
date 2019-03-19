let express = require('express');
let router = express.Router();

let AuthViews = require('../handlers/auth');
let CartViews = require('../handlers/cart');
let GoodsView = require('../handlers/goods');
let OrderViews = require('../handlers/orders');
let AdministrationViews = require('../handlers/administration');


router.get('/promotions', AdministrationViews.Promotions);
router.get('/goods', GoodsView.Goods);
router.get('/promotion/goods', AdministrationViews.PromotionGoods);
router.get('/user/orders', OrderViews.GetOrders);
router.get('/orders/goods', OrderViews.GetOrderedGoods);
router.get('/orders/all', AdministrationViews.Orders);

router.post('/login', AuthViews.Login);
router.post('/token/verify', AuthViews.VerifyToken);
router.post('/promotions', AdministrationViews.Promotions);
router.post('/cart/goods/add', CartViews.GoodsAdd);
router.post('/cart/goods/remove', CartViews.GoodsRemove);

router.put('/promotion/goods', AdministrationViews.PromotionGoods);
router.put('/orders/all', AdministrationViews.Orders);

router.delete('/goods', GoodsView.Goods);
router.delete('/promotions', AdministrationViews.Promotions);

module.exports = router;
