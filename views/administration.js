const path = require('path');
const util = require('./util');
const settings = require('./settings');

module.exports = {
	Administration: function (request, response) {
		if (request.method === 'GET') {
			util.VerifyToken(request, settings.SecretKey,
				() => {
					response.sendFile(path.resolve('static/html/administration.html'));
				},
				() => {
					console.log('Could not verify token');
					response.status(403);
					response.send('<h3 style="text-align: center">403 Forbidden</h3>');
				}
			);
		} else {
			response.status(406);
			response.send('<h3 style="text-align: center">406 Not Acceptable</h3>');
		}
	}
};
