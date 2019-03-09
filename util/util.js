const jwt = require('jsonwebtoken');
const settings = require('./settings');
const dbModule = require('./db');

let db = new dbModule.Db(settings.DbPath);

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

let HandleRequest = ({request, response, get, post, put}) => {
	let isJson = request.headers['accept'] === 'application/json';
	if (request.method === 'GET') {
		if (get) {
			get(request, response);
		} else {
			SendNotAcceptable(response, null, isJson);
		}
	} else if (request.method === 'POST') {
		if (post) {
			post(request, response);
		} else {
			SendNotAcceptable(response, null, isJson);
		}
	} else if (request.method === 'PUT') {
		if (put) {
			put(request, response);
		} else {
			SendNotAcceptable(response, null, isJson);
		}
	} else {
		SendNotAcceptable(response, null, isJson);
	}
};

let HandleAuthRequest = ({request, response, get, post, put}) => {
	VerifyToken(request, settings.SecretKey,
		(data) => {
			db.getUser(data.username, (user) => {
				request['user'] = user;
				HandleRequest({
					request: request,
					response: response,
					get: get,
					post: post,
					put: put
				});
			}, () => {
				SendNotFound(response, 'user is not found');
			});
		},
		() => {
			console.log('Could not verify token');
			SendForbidden(response);
		}
	);
};

let sendJsonError = (response, err, code, detail) => {
	response.setHeader('Content-Type', 'application/json');
	response.status(code);
	let message = {
		error: err
	};
	if (detail) {
		message['detail'] = detail
	}
	response.send(JSON.stringify(message));
};

let sendHtmlError = (response, err, code, detail) => {
	response.status(code);
	let htmlMsg = '<h3 style="text-align: center">' + code + ' ' + err + '</h3>';
	if (detail) {
		htmlMsg += '<h5 style="text-align: center">' + detail + '</h5>';
	}
	response.send(htmlMsg);
};

let SendNotAcceptable = (response, detail, json = true) => {
	if (json) {
		sendJsonError(response, 'Not Acceptable', 406, detail);
	} else {
		sendHtmlError(response, 'Not Acceptable', 406, detail);
	}
};

let SendNotFound = (response, detail, json = true) => {
	if (json) {
		sendJsonError(response, 'Not Found', 404, detail);
	} else {
		sendHtmlError(response, 'Not Found', 404, detail);
	}
};

let SendBadRequest = (response, detail, json = true) => {
	if (json) {
		sendJsonError(response, 'Bad Request', 400, detail);
	} else {
		sendHtmlError(response, 'Bad Request', 400, detail);
	}
};

let SendForbidden = (response, detail, json = true) => {
	if (json === true) {
		sendJsonError(response, 'Forbidden', 403, detail);
	} else {
		sendHtmlError(response, 'Forbidden', 403, detail);
	}
};

let SendInternalServerError = (response, detail, json = true) => {
	if (json === true) {
		sendJsonError(response, 'Internal Server Error', 500, detail);
	} else {
		sendHtmlError(response, 'Internal Server Error', 500, detail);
	}
};

let sendJsonResponse = (response, code, content) => {
	response.setHeader('Content-Type', 'application/json');
	response.status(code);
	response.send(JSON.stringify(content));
};

let SendOk = (response, content) => {
	sendJsonResponse(response, 200, content);
};

let SendCreated = (response, content) => {
	sendJsonResponse(response, 201, content);
};

module.exports = {
	VerifyToken: VerifyToken,
	SendNotAcceptable: SendNotAcceptable,
	SendNotFound: SendNotFound,
	SendBadRequest: SendBadRequest,
	SendOk: SendOk,
	SendCreated: SendCreated,
	SendForbidden: SendForbidden,
	SendInternalServerError: SendInternalServerError,
	HandleJsonRequest: HandleRequest,
	HandleAuthJsonRequest: HandleAuthRequest
};
