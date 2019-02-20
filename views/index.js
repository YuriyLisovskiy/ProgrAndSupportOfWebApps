let path = require('path');

module.exports = {
	Index: async function (request, response) {
		response.sendFile(path.resolve('static/html/index.html'));
	}
};
