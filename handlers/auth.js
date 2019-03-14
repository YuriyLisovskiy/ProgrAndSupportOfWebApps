const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const util = require('../util/util');
const settings = require('../util/settings');

let db = settings.Db;

let Login = (request, response) => {
	util.HandleRequest({
		request: request,
		response: response,
		post: (request, response) => {
			let credentials = request.body;
			db.getUser(credentials.username, null,
				(user) => {
					if (user) {
						let pwd_hash = crypto.createHash('sha256').update(credentials.password).digest('base64');
						if (pwd_hash === user.password) {
							jwt.sign(user, settings.SecretKey, { expiresIn: '1h' }, (err, token) => {
								if (err) {
									console.log(err);
									util.SendBadRequest(response);
								} else {
									util.SendSuccessResponse(response, 200, {
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
					} else {
						util.SendNotFound(response, 'User is not found');
					}
				},
				(err) => {
					console.log(err);
					util.SendNotFound(response, 'User does not exist');
				}
			);
		}
	});
};

let Register = (request, response) => {
	util.HandleRequest({
		request: request,
		response: response,
		post: (request, response) => {
			let credentials = request.body;
			db.getUser(credentials.username, credentials.email,
				(user) => {
					if (user) {
						util.SendBadRequest(response, 'user already exists');
					} else {
						db.createUser(
							credentials.username,
							credentials.email,
							credentials.password,
							() => {
								db.getUser(credentials.username, credentials.email,
									(item) => {
										jwt.sign(item, settings.SecretKey, { expiresIn: '1h' }, (err, token) => {
											if (err) {
												util.SendBadRequest(response);
											} else {
												util.SendSuccessResponse(response, 201, {
													key: token,
													user: {
														username: item.username,
														is_superuser: item.is_superuser
													}
												});
											}
										});
									},
									(err) => {
										console.log('[ERROR] auth.Register, post, getUser: ' + err.detail);
										util.SendInternalServerError(response, err.detail);
									}
								);
							},
							(err) => {
								console.log('[ERROR] auth.Register, post, createUser: ' + err.detail);
								util.SendInternalServerError(response, err.detail);
							}
						);
					}
				},
				(err) => {
					console.log('[ERROR] auth.Register, getUser: ' + err.detail);
					util.SendInternalServerError(response, 'unable to retrieve user');
				}
			);
		}
	});
};

let Logout = (request, response) => {
	if (request.method === 'GET' || request.method === 'POST') {
		response.redirect('/');
	} else {
		util.SendNotAcceptable(response);
	}
};

let VerifyToken = (request, response) => {
	util.HandleAuthRequest({
		request: request,
		response: response,
		post: (request, response) => {
			util.SendSuccessResponse(response, 200, {
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
