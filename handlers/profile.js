const util = require('../util/util');
const settings = require('../util/settings');

let db = settings.Db;

module.exports = {
	Profile: function (request, response) {
		util.HandleAuthRequest({
			request: request,
			response: response,
			get: (request, response) => {
				response.render('profile', {user: request.user});
			},
			post: (request, response) => {
				console.log(request.body);
				response.redirect('/profile');
			}
		});
	},
};
