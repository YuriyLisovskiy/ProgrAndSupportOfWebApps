const path = require('path');
const util = require('../util/util');
const settings = require('../util/settings');
const dbModule = require('../util/db');

let db = new dbModule.Db(settings.DbPath);

let postCreateGoods = (request, response) => {
	let data = request.body;
	db.createGoods(data.title, parseFloat(data.price), data.description,
		() => {
			response.redirect('/administration');
		},
		(err) => {
			console.log(err);
			util.SendBadRequest(response, err, false);
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
						util.SendCreated(response, item)
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
		util.VerifyToken(request, settings.SecretKey,
			(data) => {
				db.getUser(data.username, (user) => {
					if (request.method === 'GET') {
						if (user.is_superuser) {
							response.sendFile(path.resolve('static/html/administration.html'));
						} else {
							util.SendForbidden(response, null, false);
						}
					} else if (request.method === 'POST') {
						postCreateGoods(request, response);
					} else {
						util.SendNotAcceptable(response);
					}
				}, () => {
					util.SendNotFound(response, null, false);
				});
			},
			() => {
				console.log('Could not verify token');
				util.SendForbidden(response, null, false);
			}
		);
	},
	Promotions: function (request, response) {
		util.VerifyToken(request, settings.SecretKey,
			(data) => {
				db.getUser(data.username, (user) => {
					if (request.method === 'GET') {
						if (user.is_superuser) {
							let page = request.query.page;
							let limit = request.query.limit;
							db.getPromotions(
								(promotions) => {
									util.SendOk(response, {
										promotions: promotions.slice(limit * (page - 1), limit * page),
										pages: Math.ceil(promotions.length / limit),
									});
								},
								() => {
									util.SendInternalServerError(response);
								}
							);
						} else {
							util.SendForbidden(response, null, false);
						}
					} else if (request.method === 'POST') {
						postCreatePromotion(request, response);
					} else {
						util.SendNotAcceptable(response);
					}
				}, () => {
					util.SendNotFound(response, null, false);
				});
			},
			() => {
				console.log('Could not verify token');
				util.SendForbidden(response, null, false);
			}
		);
	},
	PromotionGoods: function (request, response) {
		util.VerifyToken(request, settings.SecretKey,
			(data) => {
				db.getUser(data.username, (user) => {
					if (request.method === 'GET') {
						if (user.is_superuser) {
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
									util.SendOk(response, {
										goods: updGoods,
										pages: Math.ceil(goods.length / limit),
									});
								},
								() => {
									util.SendInternalServerError(response);
								}
							);
						} else {
							util.SendForbidden(response, null, false);
						}
					} else if (request.method === 'DELETE') {
						removeGoodsFromPromotion(request, response);
					} else {
						util.SendNotAcceptable(response);
					}
				}, () => {
					util.SendNotFound(response, null, false);
				});
			},
			() => {
				console.log('Could not verify token');
				util.SendForbidden(response, null, false);
			}
		);
	}
};
