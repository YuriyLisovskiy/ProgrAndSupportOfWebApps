const sqlite3 = require('sqlite3');
const crypto = require('crypto');

class Db {
	constructor(path) {
		this.db = new sqlite3.Database(path, (err) => {
			if (err) {
				return console.error(err.message);
			}
			console.log('Connected to the SQLite database.');
		});
	}

	getUser (username, success, failed) {
		this.db.get(
			`SELECT username, email, password, is_superuser FROM Users WHERE username = ?;`,
			[username],
			(err, user) => {
				if (err) {
					console.log(err);
					failed({detail: err});
				} else if (user) {
					success(user);
				} else {
					failed({detail: 'user \'' + username +'\' does not exist'});
				}
			}
		);
	};

	createUser (username, email, rawPassword, success, failed) {
		let query = this.db.prepare(`INSERT INTO Users (email, username, password) VALUES (?, ?, ?);`);
		let passwordHash = crypto.createHash('sha256').update(rawPassword).digest('base64');
		query.run([email, username, passwordHash], (err) => {
				if (err) {
					failed(err);
				} else {
					success();
				}
			}
		);
	}

	getGoods (success, failed) {
		this.db.all(
			`SELECT code, title, price, description FROM Goods;`,
			(err, goods) => {
				if (err) {
					console.log(err);
					failed({detail: err});
				} else if (goods) {
					success(goods);
				} else {
					failed();
				}
			}
		);
	}

	createGoods (title, price, description, success, failed) {
		let query = this.db.prepare(`INSERT INTO Goods (title, price, description) VALUES (?, ?, ?);`);
		query.run([title, price, description], (err) => {
				if (err) {
					failed(err);
				} else {
					success();
				}
			}
		);
	}

	deleteGoods (code, success, failed) {
		let query = this.db.prepare(`DELETE FROM Goods WHERE Goods.code = ?`);
		query.run([code], (err) => {
				if (err) {
					failed(err);
				} else {
					success();
				}
			}
		);
	}
}

module.exports = {
	Db: Db
};
