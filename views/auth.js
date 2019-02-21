let login = async (request, response) => {
	response.setHeader('Content-Type', 'application/json');
	if (request.method === 'POST') {
		let credentials = request.body;

		console.log(credentials);

		// TODO: send jwt token to user

		response.send(JSON.stringify({detail: 'Login is successful!'}))
	} else {
		response.status(406);
		response.send(JSON.stringify({detail: 'Not Acceptable'}))
	}
};

let register = async (request, response) => {
	response.setHeader('Content-Type', 'application/json');
	if (request.method === 'POST') {
		let credentials = request.body;

		console.log(credentials);

		// TODO: save user to database

		response.send(JSON.stringify({detail: 'Registration is successful!'}))
	} else {
		response.status(406);
		response.send(JSON.stringify({detail: 'Not Acceptable'}))
	}
};

let logout = async (request, response) => {
	// TODO: remove jwt token

	response.redirect('/');
};

module.exports = {
	Login: login,
	Register: register,
	Logout: logout
};
