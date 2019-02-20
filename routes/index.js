let express = require('express');
let router = express.Router();

let IndexView = require('../views/index');
let GoodsView = require('../views/goods');

router.get('/', IndexView.Index);
router.get('/api/v1/goods', GoodsView.Goods);

module.exports = router;
