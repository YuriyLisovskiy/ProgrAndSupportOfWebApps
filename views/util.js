const jwt = require('jsonwebtoken');

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

let SendJsonNotAcceptable = (response, detail) => {
	sendJsonError(response, 'Not acceptable', 406, detail);
};

let SendJsonNotFound = (response, detail) => {
	sendJsonError(response, 'Not Found', 404, detail);
};

let SendJsonBadRequest = (response, detail) => {
	sendJsonError(response, 'Bad Request', 400, detail);
};

let SendJsonForbidden = (response, detail) => {
	sendJsonError(response, 'Forbidden', 403, detail);
};

let sendJsonResponse = (response, code, content) => {
	response.setHeader('Content-Type', 'application/json');
	response.status(code);
	response.send(JSON.stringify(content));
};

let SendJsonOk = (response, content) => {
	sendJsonResponse(response, 200, content);
};

let SendJsonCreated = (response, content) => {
	sendJsonResponse(response, 201, content);
};

module.exports = {
	VerifyToken: VerifyToken,
	SendJsonNotAcceptable: SendJsonNotAcceptable,
	SendJsonNotFound: SendJsonNotFound,
	SendJsonBadRequest: SendJsonBadRequest,
	SendJsonOk: SendJsonOk,
	SendJsonCreated: SendJsonCreated,
	SendJsonForbidden: SendJsonForbidden
};
