const jwt = require('jsonwebtoken');

let verifyToken = (request, secret, success, failed) => {
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

module.exports = {
	VerifyToken: verifyToken
};
