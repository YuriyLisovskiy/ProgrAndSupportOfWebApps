const path = require('path');
const util = require('../util/util');

module.exports = {
	Index: function (request, response) {
		if (request.method === 'GET') {
			response.sendFile(path.resolve('static/html/index.html'));
		} else {
			util.SendNotAcceptable(response);
		}
	}
};
