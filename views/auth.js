let sqlite3 = require('sqlite3').verbose();
let crypto = require('crypto');
const jwt = require('jsonwebtoken');

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
		db.get(
			`SELECT email, username, password FROM Users WHERE username = ?;`,
			[credentials.username],
			(err, user) => {
				if (err) {
					console.log(err);
				} else if (user) {
					let pwd_hash = crypto.createHash('sha256').update(credentials.password).digest('base64');
					if (credentials.username === user.username && pwd_hash === user.password) {
						jwt.sign({user}, 'private_key', { expiresIn: '1h' }, (err, token) => {
							if (err) {
								console.log(err);
							}
							response.send(JSON.stringify({key: token}));
						});
					} else {
						console.log('ERROR: Could not log in');
						response.send(JSON.stringify({detail: 'Could not login!'}))
					}
				} else {
					response.send(JSON.stringify({detail: 'User does not exist!'}));
				}
			}
		);
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
	response.redirect('/');
};

module.exports = {
	Login: login,
	Register: register,
	Logout: logout
};
