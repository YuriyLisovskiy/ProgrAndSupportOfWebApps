const util = require('./util');
const crypto = require('crypto');
const dbModule = require('./db');
const jwt = require('jsonwebtoken');
const settings = require('./settings');

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
							util.SendJsonBadRequest(response);
						} else {
							util.SendJsonCreated(response, {
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
				util.SendJsonCreated(response, {detail: 'registration is successful'});
			},
			(err) => {
				console.log(err);
				util.SendJsonBadRequest(response, err);
			}
		);
	} else {
		util.SendJsonNotAcceptable(response);
	}
};

let Logout = (request, response) => {
	if (request.method === 'GET' || request.method === 'POST') {
		response.redirect('/');
	} else {
		util.SendJsonNotAcceptable(response);
	}
};

let VerifyToken = (request, response) => {
	if (request.method === 'POST') {
		util.VerifyToken(request, settings.SecretKey,
			(data) => {
				db.getUser(data.username,
					(user) => {
						util.SendJsonCreated(response, {
							detail: 'token is verified',
							user: {
								username: user.username,
								is_superuser: user.is_superuser
							}
						});
					},
					(err) => {
						console.log(err);
						util.SendJsonNotFound(response, 'user does not exist');
					}
				);
			},
			() => {
				console.log('Could not verify token');
				util.SendJsonForbidden(response, 'could not verify token');
			}
		);
	} else {
		util.SendJsonNotAcceptable(response);
	}
};

module.exports = {
	Login: Login,
	Register: Register,
	Logout: Logout,
	VerifyToken: VerifyToken
};
