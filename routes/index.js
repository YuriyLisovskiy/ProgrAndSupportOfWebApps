let express = require('express');
let router = express.Router();

let IndexView = require('../views/index');
let GoodsView = require('../views/goods');
let AuthViews = require('../views/auth');

router.get('/', IndexView.Index);
router.get('/logout', AuthViews.Logout);
router.get('/api/goods', GoodsView.Goods);

router.post('/api/login', AuthViews.Login);
router.post('/api/token/verify', AuthViews.VerifyToken);
router.post('/api/register', AuthViews.Register);

module.exports = router;
