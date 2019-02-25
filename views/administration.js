const path = require('path');
const util = require('./util');
const settings = require('./settings');
const dbModule = require('./db');

let db = new dbModule.Db(settings.DbPath);

let get = (response, user) => {
	if (user.is_superuser) {
		response.sendFile(path.resolve('static/html/administration.html'));
	} else {
		util.SendForbidden(response, null, false);
	}
};

let post = (request, response) => {
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

module.exports = {
	Administration: function (request, response) {
		util.VerifyToken(request, settings.SecretKey,
			(data) => {
				db.getUser(data.username, (user) => {
					if (request.method === 'GET') {
						get(response, user);
					} else {
						post(request, response);
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
