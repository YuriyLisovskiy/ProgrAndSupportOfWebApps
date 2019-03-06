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
					util.SendOk(response, {
						goods: goods.slice(limit * (page - 1), limit * page),
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
