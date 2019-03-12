const jwt = require('jsonwebtoken');
const settings = require('./settings');

let db = settings.Db;

let VerifyToken = (request, secret, success, failed) => {
	let token = request.cookies['auth_token'];
	if (token) {
		jwt.verify(token, secret, (err, data) => {
			if (err) {
				failed(err);
			} else {
				success(data);
			}
		});
	} else {
		failed({detail: 'header is undefined'});
	}
};

let HandleRequest = ({request, response, get, post, put, delete_}) => {
	let finished = () => {
		delete request.user.password;

		if (!response.hasOwnProperty('send_json')) {
			response['send_json'] = request.headers['accept'] === 'application/json';
		}
		if (request.method === 'GET') {
			if (get) {
				get(request, response);
			} else {
				SendNotAcceptable(response);
			}
		} else if (request.method === 'POST') {
			if (post) {
				post(request, response);
			} else {
				SendNotAcceptable(response);
			}
		} else if (request.method === 'PUT') {
			if (put) {
				put(request, response);
			} else {
				SendNotAcceptable(response);
			}
		} else if (delete_) {
			delete_(request, response);
		} else {
			SendNotAcceptable(response);
		}
	};
	if (!request.user) {
		request.user = {
			is_authenticated: false
		};
		VerifyToken(request, settings.SecretKey,
			function (data) {
				db.getUser(data.username, (user) => {
					request['user'] = user;
					request['user']['is_authenticated'] = true;
					finished();
				}, (err) => {
					console.log(err);
					finished();
				});
			},
			(err) => {
				console.log(err);
				finished();
			}
		);
	} else {
		finished();
	}
};

let HandleAuthRequest = ({request, response, get, post, put, delete_}) => {
	response['send_json'] = request.headers['accept'] === 'application/json';
	VerifyToken(request, settings.SecretKey,
		(data) => {
			db.getUser(data.username, (user) => {
				request['user'] = user;
				request.user['is_authenticated'] = true;
				HandleRequest(
					{request: request, response: response, get: get, post: post, put: put, delete_: delete_}
				);
			}, () => {
				SendNotFound(response, 'User is not found');
			});
		},
		() => {
			console.log('Could not verify token');
			SendForbidden(response);
		}
	);
};

let sendError = (response, err, code, detail) => {
	let responseData = null;
	if (response['send_json']) {
		response.setHeader('Content-Type', 'application/json');
		let message = {error: err};
		if (detail) {
			message['detail'] = detail
		}
		responseData = JSON.stringify(message);
	} else {
		responseData = '<h3 style="text-align: center">' + code + ' ' + err + '</h3>';
		if (detail) {
			responseData += '<h5 style="text-align: center">' + detail + '</h5>';
		}
	}
	response.status(code);
	response.send(responseData);
};

let SendNotAcceptable = (response, detail) => {
	sendError(response, 'Not Acceptable', 406, detail);
};

let SendNotFound = (response, detail) => {
	sendError(response, 'Not Found', 404, detail);
};

let SendBadRequest = (response, detail) => {
	sendError(response, 'Bad Request', 400, detail);
};

let SendForbidden = (response, detail) => {
	sendError(response, 'Forbidden', 403, detail);
};

let SendInternalServerError = (response, detail) => {
	sendError(response, 'Internal Server Error', 500, detail);
};

let SendSuccessResponse = (response, code, content) => {
	let responseData = content;
	if (response['send_json']) {
		response.setHeader('Content-Type', 'application/json');
		responseData = JSON.stringify(content);
	}
	response.status(code);
	response.send(responseData);
};

let Render = (request, response, template, context = null) => {
	if (!context) {
		context = {};
	}
	context['user'] = request.user;
	response.render(template, context);
};

module.exports = {
//	VerifyToken: VerifyToken,
	SendNotAcceptable: SendNotAcceptable,
	SendNotFound: SendNotFound,
	SendBadRequest: SendBadRequest,
	SendForbidden: SendForbidden,
	SendInternalServerError: SendInternalServerError,
	HandleRequest: HandleRequest,
	HandleAuthRequest: HandleAuthRequest,
	SendSuccessResponse: SendSuccessResponse,
	Render: Render
};
