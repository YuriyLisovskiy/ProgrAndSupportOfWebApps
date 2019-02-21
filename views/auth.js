let sqlite3 = require('sqlite3').verbose();
let crypto = require('crypto');
const jwt = require('jsonwebtoken');

let secretKey = 'secret_key';

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
						jwt.sign({user}, secretKey, { expiresIn: '1h' }, (err, token) => {
							if (err) {
								console.log(err);
								response.sendStatus(400);
							} else {
								response.send(JSON.stringify({key: token}));
							}
						});
					} else {
						console.log('ERROR: Could not log in');
						response.status(400);
						response.send(JSON.stringify({detail: 'Could not login!'}))
					}
				} else {
					response.status(404);
					response.send(JSON.stringify({detail: 'User does not exist!'}));
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

let verifyToken = async (request, response) => {
	response.setHeader('Content-Type', 'application/json');
	if (request.method === 'POST') {
		const header = request.headers['authorization'];
		if (typeof header !== 'undefined') {
			let token = header.split(' ')[1];
			jwt.verify(token, secretKey, (err, authorizedData) => {
				if (err) {
					console.log('Could not verify token');
					response.status(403);
					response.send(JSON.stringify({detail: 'Could not verify token'}));
				} else {
					response.json({
						message: 'Successful log in',
						authorizedData
					});
					console.log('Token is verified!');
				}
			});
		} else {
			response.sendStatus(403);
		}
	}
};

module.exports = {
	Login: login,
	Register: register,
	Logout: logout,
	VerifyToken: verifyToken
};
