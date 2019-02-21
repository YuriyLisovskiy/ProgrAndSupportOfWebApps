let express = require('express');
let router = express.Router();

let IndexView = require('../views/index');
let GoodsView = require('../views/goods');
let AuthViews = require('../views/auth');

router.get('/', IndexView.Index);
router.post('/api/login', AuthViews.Login);
router.get('/logout', AuthViews.Logout);
router.post('/api/register', AuthViews.Register);
router.get('/api/goods', GoodsView.Goods);

module.exports = router;
