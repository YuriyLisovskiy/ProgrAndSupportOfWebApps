const util = require('../util/util');
const settings = require('../util/settings');
const dbModule = require('../util/db');

let db = new dbModule.Db(settings.DbPath);

module.exports = {
	Goods: function (request, response) {
		if (request.method === 'GET') {
			let page = request.query.page;
			let limit = request.query.limit;
			db.getGoods(
				(goods) => {
					let updGoods = goods.slice(limit * (page - 1), limit * page);
					for (let i = 0; i < updGoods.length; i++) {
						let discount = updGoods[i].discount_percentage;
						if (discount) {
							let price = updGoods[i].price;
							updGoods[i]['discount_price'] = Number(price - price * discount / 100).toFixed(2);
						}
					}
					util.SendOk(response, {
						goods: updGoods,
						pages: Math.ceil(goods.length / limit),
					});
				},
				() => {
					util.SendInternalServerError(response);
				}
			);
		} else if (request.method === 'DELETE') {
			db.deleteGoods(request.body.goods_code,
				() => {
					util.SendOk(response, {detail: 'goods item is deleted'})
				},
				(err) => {
					util.SendInternalServerError(response, err);
				}
			);
		} else {
			util.SendNotAcceptable(response);
		}
	}
};
