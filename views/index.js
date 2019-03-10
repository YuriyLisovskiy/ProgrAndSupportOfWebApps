const path = require('path');
const util = require('../util/util');

module.exports = {
	Index: function (request, response) {
		util.HandleRequest({
			request: request,
			response: response,
			get: (request, response) => {
				response.sendFile(path.resolve('static/html/index.html'));
			}
		});
	}
};
