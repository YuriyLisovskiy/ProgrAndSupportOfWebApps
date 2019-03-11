let express = require('express');
let router = express.Router();

let IndexView = require('../handlers');
let GoodsView = require('../handlers/goods');
let AuthViews = require('../handlers/auth');
let AdministrationViews = require('../handlers/administration');

router.get('/', IndexView.Index);
router.get('/logout', AuthViews.Logout);
router.get('/administration', AdministrationViews.Administration);
router.get('/administration/goods/((\\d+))/edit', AdministrationViews.EditGoods);
router.get('/administration/promotions/((\\d+))/edit', AdministrationViews.EditPromotion);

router.post('/administration', AdministrationViews.Administration);
router.post('/administration/goods/((\\d+))/edit', AdministrationViews.EditGoods);
router.post('/administration/promotions/((\\d+))/edit', AdministrationViews.EditPromotion);


router.get('/api/promotions', AdministrationViews.Promotions);
router.get('/api/goods', GoodsView.Goods);
router.get('/api/promotion/goods', AdministrationViews.PromotionGoods);

router.post('/api/login', AuthViews.Login);
router.post('/api/register', AuthViews.Register);
router.post('/api/token/verify', AuthViews.VerifyToken);
router.post('/api/promotions', AdministrationViews.Promotions);

router.put('/api/promotion/goods', AdministrationViews.PromotionGoods);

router.delete('/api/goods', GoodsView.Goods);
router.delete('/api/promotions', AdministrationViews.Promotions);

module.exports = router;
