const path = require('path');
const util = require('../util/util');
const settings = require('../util/settings');

let db = settings.Db;

let postCreateGoods = (request, response) => {
	let data = request.body;
	let promotionId = null;
	if (data.promotion !== 'none') {
		promotionId = data.promotion;
	}
	db.createGoods(data.title, parseFloat(data.price), data.description, promotionId,
		() => {
			response.redirect('/administration');
		},
		(err) => {
			console.log(err);
			util.SendBadRequest(response, err);
		}
	);
};

let postCreatePromotion = (request, response) => {

};

let removeGoodsFromPromotion = (request, response) => {
	let id = request.body.goods_code;
	if (id) {
		db.getGoodsById(id,
			(item) => {
				item.promotion = null;
				db.updateGoods(item,
					() => {
						util.SendSuccessResponse(response, 201, item)
					},
					() => {
						util.SendInternalServerError(response, 'Unable to update goods');
					}
				);
			},
			() => {
				util.SendNotFound(response, 'Goods not found')
			}
		);
	}
};

module.exports = {
	Administration: function (request, response) {
		util.HandleAuthRequest({
			request: request,
			response: response,
			get: (request, response) => {
				if (request.user.is_superuser) {
					response.sendFile(path.resolve('static/html/administration.html'));
				} else {
					util.SendForbidden(response);
				}
			},
			post: (request, response) => {
				postCreateGoods(request, response);
			}
		});
	},
	Promotions: function (request, response) {
		util.HandleAuthRequest({
			request: request,
			response: response,
			get: (request, response) => {
				if (request.user.is_superuser) {
					let page = request.query.page;
					let limit = request.query.limit;
					db.getPromotions(
						(promotions) => {
							util.SendSuccessResponse(response, 200, {
								promotions: promotions.slice(limit * (page - 1), limit * page),
								pages: Math.ceil(promotions.length / limit),
							});
						},
						() => {
							util.SendInternalServerError(response);
						}
					);
				} else {
					util.SendForbidden(response);
				}
			},
			post: (request, response) => {
				postCreatePromotion(request, response);
			}
		});
	},
	PromotionGoods: function (request, response) {
		util.HandleAuthRequest({
			request: request,
			response: response,
			get: (request, response) => {
				if (request.user.is_superuser) {
					let page = request.query.page;
					let limit = request.query.limit;
					db.filterGoodsByPromotion(
						request.query.promotion,
						(goods) => {
							let updGoods = goods.slice(limit * (page - 1), limit * page);
							for (let i = 0; i < updGoods.length; i++) {
								let discount = updGoods[i]['discount_price'];
								let price = updGoods[i].price;
								updGoods[i]['discount_price'] = Number(price - price * discount / 100).toFixed(2);
							}
							util.SendSuccessResponse(response, 200, {
								goods: updGoods,
								pages: Math.ceil(goods.length / limit),
							});
						},
						() => {
							util.SendInternalServerError(response);
						}
					);
				} else {
					util.SendForbidden(response);
				}
			},
			put: (request, response) => {
				removeGoodsFromPromotion(request, response);
			}
		});
	}
};
