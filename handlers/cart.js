const util = require('../util/util');
const settings = require('../util/settings');

let db = settings.Db;

module.exports = {
	Cart: function (request, response) {
		util.HandleAuthRequest({
			request: request,
			response: response,
			get: (request, response) => {
				response.render('cart', {
					user: {
						username: request.user.username,
						email: request.user.email,
					}
				});
			},
		});
	},
};
