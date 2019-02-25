const path = require('path');
const util = require('./util');
const settings = require('./settings');
const dbModule = require('./db');

let db = new dbModule.Db(settings.DbPath);

let get = (request, response) => {
	util.VerifyToken(request, settings.SecretKey,
		(data) => {
			db.getUser(data.username, (user) => {
				if (user.is_superuser) {
					response.sendFile(path.resolve('static/html/administration.html'));
				} else {
					response.status(403);
					response.send('<h3 style="text-align: center">403 Forbidden</h3>');
				}
			}, () => {
				response.status(404);
				response.send('<h3 style="text-align: center">404 Not Found</h3>');
			});
		},
		() => {
			console.log('Could not verify token');
			response.status(403);
			response.send('<h3 style="text-align: center">403 Forbidden</h3>');
		}
	);
};

let post = (request, response) => {
	response.status(406);
	response.send('<h3 style="text-align: center">406 Not Acceptable</h3>');
};

module.exports = {
	Administration: function (request, response) {
		if (request.method === 'GET') {
			get(request, response);
		} else {
			post(request, response);
		}
	}
};
