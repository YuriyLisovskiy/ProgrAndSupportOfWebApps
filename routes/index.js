let express = require('express');
let router = express.Router();

let IndexView = require('../views/index');
let GoodsView = require('../views/goods');
let AuthViews = require('../views/auth');
let AdministrationViews = require('../views/administration');

router.get('/', IndexView.Index);
router.get('/logout', AuthViews.Logout);
router.get('/administration', AdministrationViews.Administration);

router.post('/administration', AdministrationViews.Administration);


router.get('/api/promotions', AdministrationViews.Promotions);
router.get('/api/goods', GoodsView.Goods);

router.post('/api/login', AuthViews.Login);
router.post('/api/register', AuthViews.Register);
router.post('/api/token/verify', AuthViews.VerifyToken);

router.delete('/api/goods', GoodsView.Goods);

module.exports = router;
