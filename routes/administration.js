let express = require('express');
let router = express.Router();

let AdministrationViews = require('../handlers/administration');

router.get('/', AdministrationViews.Administration);
router.get('/goods/((\\d+))/edit', AdministrationViews.EditGoods);
router.get('/promotions/((\\d+))/edit', AdministrationViews.EditPromotion);

router.post('', AdministrationViews.Administration);
router.post('/goods/((\\d+))/edit', AdministrationViews.EditGoods);
router.post('/promotions/((\\d+))/edit', AdministrationViews.EditPromotion);

module.exports = router;
