const util = require('../util/util');
const crypto = require('crypto');
const dbModule = require('../util/db');
const jwt = require('jsonwebtoken');
const settings = require('../util/settings');

let db = new dbModule.Db(settings.DbPath);

let Login = (request, response) => {
	if (request.method === 'POST') {
		let credentials = request.body;
		db.getUser(credentials.username,
			(user) => {
				let pwd_hash = crypto.createHash('sha256').update(credentials.password).digest('base64');
				if (pwd_hash === user.password) {
					jwt.sign(user, settings.SecretKey, { expiresIn: '1h' }, (err, token) => {
						if (err) {
							console.log(err);
							util.SendBadRequest(response);
						} else {
							util.SendCreated(response, {
								key: token,
								user: {
									username: user.username,
									is_superuser: user.is_superuser
								}
							});
						}
					});
				} else {
					util.SendBadRequest(response, 'invalid credentials');
				}
			},
			(err) => {
				console.log(err);
				util.SendNotFound(response, 'user does not exist');
			}
		);
	} else {
		util.SendNotAcceptable(response);
	}
};

let Register = (request, response) => {
	if (request.method === 'POST') {
		let credentials = request.body;
		db.createUser(
			credentials.username,
			credentials.email,
			credentials.password,
			() => {
				util.SendCreated(response, {detail: 'registration is successful'});
			},
			(err) => {
				console.log(err);
				util.SendBadRequest(response, err);
			}
		);
	} else {
		util.SendNotAcceptable(response);
	}
};

let Logout = (request, response) => {
	if (request.method === 'GET' || request.method === 'POST') {
		response.redirect('/');
	} else {
		util.SendNotAcceptable(response);
	}
};

let VerifyToken = (request, response) => {
	util.HandleAuthJsonRequest({
		request: request,
		response: response,
		post: (request, response) => {
			util.SendCreated(response, {
				detail: 'token is verified',
				user: {
					username: request.user.username,
					is_superuser: request.user.is_superuser
				}
			});
		}
	});
};

module.exports = {
	Login: Login,
	Register: Register,
	Logout: Logout,
	VerifyToken: VerifyToken
};
