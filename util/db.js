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

	createDb() {
		let query = this.db.prepare(`CREATE TABLE Users (
  email         VARCHAR(255)  NOT NULL,
  username      VARCHAR(100)  PRIMARY KEY,
  password      VARCHAR(100)  NOT NULL,
  is_superuser  BOOLEAN       DEFAULT FALSE
);

CREATE TABLE Promotions (
  id            INTEGER       PRIMARY KEY,
  percentage    INTEGER       DEFAULT 0,
  comment       VARCHAR(255)  NULL
);

CREATE TABLE Goods (
  code          INTEGER       PRIMARY KEY,
  title         VARCHAR(255)  NOT NULL,
  price         DECIMAL       NOT NULL,
  image         VARCHAR(500)  NULL,
  description   TEXT DEFAULT  NULL,
  promotion     INTEGER       NULL,
  FOREIGN KEY(promotion) REFERENCES Promotions(id)
);`);
		query.run((err) => {
			if (err) {
				console.log(err);
			}
		});
	}

	getData(query, params, success, failed) {
		this.db.all(
			query,
			params,
			(err, data) => {
				if (err) {
					console.log(err);
					failed({detail: err});
				} else if (data) {
					success(data);
				} else {
					failed();
				}
			}
		);
	}

	getUser(username, success, failed) {
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

	createUser(username, email, rawPassword, success, failed) {
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

	getGoods(success, failed) {
		this.getData(`
			SELECT Goods.code, Goods.title, Goods.price, Goods.description, Promotions.percentage as discount_percentage
			FROM Goods
			LEFT JOIN Promotions ON Promotions.id = Goods.promotion
		`, [], success, failed);
	}

	getGoodsById(id, success, failed) {
		this.db.get(`SELECT * FROM Goods WHERE code = ?`, [id], (err, data) => {
			if (err) {
				failed({detail: err});
			} else {
				success(data);
			}
		});
	}

	filterGoodsByPromotion(promotion, success, failed) {
		this.getData(
			`
					SELECT Goods.code, Goods.title, Goods.price, Promotions.percentage as discount_price
				  	FROM Goods
					JOIN Promotions ON Promotions.id = Goods.promotion
					WHERE Goods.promotion = ?;
				  `,
			[promotion],
			success,
			failed
		);
	}

	createGoods(title, price, description, success, failed) {
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

	updateGoods(goodsItem, success, failed) {
		let query = this.db.prepare(
			`UPDATE Goods SET title = ?, price = ?, description = ?, image = ?, promotion = ? WHERE code = ?;`
		);
		query.run([
				goodsItem.title,
				goodsItem.price,
				goodsItem.description,
				goodsItem.image,
				goodsItem.promotion,
				goodsItem.code
			], (err) => {
				if (err) {
					failed(err);
				} else {
					success();
				}
			}
		);
	}

	deleteGoods(code, success, failed) {
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

	getPromotions(success, failed) {
		this.getData(`SELECT id, percentage, comment FROM Promotions;`, [], success, failed);
	}
}

module.exports = {
	Db: Db
};
