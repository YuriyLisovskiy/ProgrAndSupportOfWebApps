let express = require('express');
let router = express.Router();

let IndexView = require('../handlers');
let AuthViews = require('../handlers/auth');
let ProfileViews = require('../handlers/profile');
let OrderViews = require('../handlers/orders');

router.get('/', IndexView.Index);
router.get('/logout', AuthViews.Logout);
router.get('/profile', ProfileViews.Profile);
router.get('/user/verify/(([A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+))', AuthViews.VerifyUser);

router.post('/register', AuthViews.Register);
router.post('/profile', ProfileViews.Profile);
router.post('/orders/create', OrderViews.CreateOrder);

module.exports = router;
