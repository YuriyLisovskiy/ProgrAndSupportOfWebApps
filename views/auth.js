let sqlite3 = require('sqlite3').verbose();
let crypto = require('crypto');

let db = new sqlite3.Database('./shop.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Connected to the in-memory SQlite database.');
});

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
		let query = db.prepare(`INSERT INTO Users (email, username, password) VALUES (?, ?, ?);`);
		let passwordHash = crypto.createHash('sha256').update(credentials.password).digest('base64');
		await query.run([credentials.email, credentials.username, passwordHash], (err) => {
				if (err != null) {
					response.status(400);
					response.send(JSON.stringify({detail: err}));
					console.log(err);
				} else {
					response.status(201);
					response.send(JSON.stringify({detail: 'Registration is successful!'}));
				}
			}
		);
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
