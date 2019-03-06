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
					} else {
						postCreateGoods(request, response);
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
					} else {
						postCreatePromotion(request, response);
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
