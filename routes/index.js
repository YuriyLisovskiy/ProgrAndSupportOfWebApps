let express = require('express');
let router = express.Router();

let IndexView = require('../views/index');
let GoodsView = require('../views/goods');
let AuthViews = require('../views/auth');
let AdministrationView = require('../views/administration');

router.get('/', IndexView.Index);
router.get('/logout', AuthViews.Logout);
router.get('/administration', AdministrationView.Administration);

router.post('/administration', AdministrationView.Administration);


router.get('/api/goods', GoodsView.Goods);

router.post('/api/login', AuthViews.Login);
router.post('/api/goods', GoodsView.Goods);
router.post('/api/register', AuthViews.Register);
router.post('/api/token/verify', AuthViews.VerifyToken);

module.exports = router;
