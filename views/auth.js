let sqlite3 = require('sqlite3').verbose();
let crypto = require('crypto');
const jwt = require('jsonwebtoken');
const util = require('./util');
const settings = require('./settings');

let db = new sqlite3.Database('./shop.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Connected to the SQLite database.');
});

let login = async (request, response) => {
	response.setHeader('Content-Type', 'application/json');
	if (request.method === 'POST') {
		let credentials = request.body;
		db.get(
			`SELECT username, password, email, is_superuser FROM Users WHERE username = ?;`,
			[credentials.username],
			(err, user) => {
				if (err) {
					console.log(err);
				} else if (user) {
					let pwd_hash = crypto.createHash('sha256').update(credentials.password).digest('base64');
					if (credentials.username === user.username && pwd_hash === user.password) {
						jwt.sign(user, settings.SecretKey, { expiresIn: '1h' }, (err, token) => {
							if (err) {
								console.log(err);
								response.sendStatus(400);
							} else {
								response.send(JSON.stringify({
									key: token,
									user: {
										username: user.username,
										is_superuser: user.is_superuser
									}
								}));
							}
						});
					} else {
						console.log('ERROR: Could not log in');
						response.status(400);
						response.send(JSON.stringify({detail: 'invalid credentials'}))
					}
				} else {
					response.status(404);
					response.send(JSON.stringify({detail: 'user does not exist'}));
				}
			}
		);
	} else {
		response.status(406);
		response.send(JSON.stringify({detail: 'Not Acceptable'}));
	}
};

let register = async (request, response) => {
	response.setHeader('Content-Type', 'application/json');
	if (request.method === 'POST') {
		let credentials = request.body;
		let query = db.prepare(`INSERT INTO Users (email, username, password) VALUES (?, ?, ?);`);
		let passwordHash = crypto.createHash('sha256').update(credentials.password).digest('base64');
		await query.run([credentials.email, credentials.username, passwordHash], (err) => {
				if (err) {
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

let verifyToken = async (request, response) => {
	response.setHeader('Content-Type', 'application/json');
	if (request.method === 'POST') {
		util.VerifyToken(request, settings.SecretKey,
			(data) => {
				response.send(JSON.stringify({
					detail: 'Token is verified!',
					user: {
						username: data.username,
						is_superuser: data.is_superuser
					}
				}));
			},
			() => {
				console.log('Could not verify token');
				response.status(403);
				response.send(JSON.stringify({detail: 'Could not verify token'}));
			}
		);
	} else {
		response.status(406);
		response.send(JSON.stringify({error: 'Not Acceptable'}));
	}
};

module.exports = {
	Login: login,
	Register: register,
	Logout: logout,
	VerifyToken: verifyToken
};
