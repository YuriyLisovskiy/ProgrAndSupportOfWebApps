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
		let query = this.db.prepare(`
          CREATE TABLE IF NOT EXISTS Users (
		    id            INTEGER       PRIMARY KEY,
		    username      VARCHAR(100)  UNIQUE NOT NULL,
		    email         VARCHAR(255)  UNIQUE NOT NULL,
		    password      VARCHAR(100)  NOT NULL,
		    first_name    VARCHAR(100)  NULL,
		    last_name     VARCHAR(100)  NULL,
		    address       VARCHAR(500)  NULL,
		    phone         VARCHAR(50)   NULL,
		    is_superuser  BOOLEAN       DEFAULT FALSE
		);
		
		CREATE TABLE IF NOT EXISTS Promotions (
		    id            INTEGER       PRIMARY KEY,
		    percentage    INTEGER       DEFAULT 0,
		    comment       VARCHAR(255)  NULL
		);
		
		CREATE TABLE IF NOT EXISTS Goods (
		    code          INTEGER       PRIMARY KEY,
		    title         VARCHAR(255)  NOT NULL,
		    price         DECIMAL       NOT NULL,
		    image         VARCHAR(500)  NULL,
		    description   TEXT DEFAULT  NULL,
		    promotion     INTEGER       NULL,
		
		    FOREIGN KEY(promotion) REFERENCES Promotions(id)
		);
		
		CREATE TABLE IF NOT EXISTS Carts (
		    id                INTEGER       PRIMARY KEY,
		    user_id           INTEGER(100)  UNIQUE,
		
		    FOREIGN KEY(user_id) REFERENCES Users(id)
		);
		
		CREATE TABLE IF NOT EXISTS GoodsCarts (
		    goods_code  INTEGER NOT NULL,
		    cart_id     INTEGER NOT NULL,
		    amount      INTEGER DEFAULT 1,
		
		    FOREIGN KEY(goods_code) REFERENCES Goods(code),
		    FOREIGN KEY(cart_id) REFERENCES Carts(id),
		
		    PRIMARY KEY (goods_code, cart_id)
		);

		CREATE TABLE IF NOT EXISTS Orders (
		  id                  INTEGER       PRIMARY KEY,
		  status              VARCHAR(20)   NOT NULL,
		  destination_address VARCHAR(500)  NOT NULL,
		  u_first_name        VARCHAR(100)  NOT NULL,
		  u_last_name         VARCHAR(100)  NOT NULL,
		  u_phone             VARCHAR(50)   NOT NULL,
		  u_email             VARCHAR(255)  NOT NULL,
		  user_id             INTEGER       NOT NULL,
		
		  FOREIGN KEY(user_id) REFERENCES Users(id)
		);
`);
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

	getUser(username, email, success, failed) {
		let query = `SELECT * FROM Users WHERE username = ?`;
		let params = [username];
		if (email) {
			query += ' AND email = ?';
			params.push(email);
		}
		this.db.get(
			query,
			params,
			(err, user) => {
				if (err) {
					console.log(err);
					failed({detail: err});
				} else {
					success(user);
				}
			}
		);
	};

	createUser(username, email, rawPassword, success, failed) {
		let query = this.db.prepare(`INSERT INTO Users (email, username, password) VALUES (?, ?, ?);`);
		let passwordHash = crypto.createHash('sha256').update(rawPassword).digest('base64');
		query.run([email, username, passwordHash], (err) => {
				if (err) {
					failed({detail: err});
				} else {
					success();
				}
			}
		);
	}

	updateUser(item, success, failed) {
		let query = this.db.prepare(`
			UPDATE Users
			  SET username = ?,
			  	  email = ?,
			  	  password = ?,
			      first_name = ?,
			      last_name = ?,
			      address = ?,
			      phone = ?,
			      is_superuser = ?
			  WHERE id = ?
		`);
		query.run([
			item.username,
			item.email,
			item.password,
			item.first_name,
			item.last_name,
			item.address,
			item.phone,
			item.is_superuser,
			item.id
		], function(err) {
			if (err) {
				failed({detail: err});
			} else {
				success(this.lastID);
			}
		});
	}

	getAllGoods(cart_pk, success, failed) {
		this.getData(`
			SELECT Goods.code, Goods.title, Goods.price, Goods.description,
			       Promotions.percentage as discount_percentage,
			       GoodsCarts.goods_code IS NOT NULL as is_in_cart
			FROM Goods
			LEFT JOIN Promotions ON Promotions.id = Goods.promotion
			LEFT JOIN GoodsCarts ON GoodsCarts.goods_code = Goods.code AND GoodsCarts.cart_id = ?
		`, [cart_pk], success, failed);
	}

	getGoodsByUserCart(user_pk, success, failed) {
		this.getData(`
            SELECT Goods.code, Goods.title, Goods.price, Goods.description,
                 Promotions.percentage as discount_percentage, GoodsCarts.amount 
			FROM Goods
            LEFT JOIN Promotions ON Promotions.id = Goods.promotion
            JOIN GoodsCarts ON GoodsCarts.goods_code = Goods.code
            JOIN Carts ON Carts.id = GoodsCarts.cart_id AND Carts.user_id = ?
		`, [user_pk], success, failed);
	}

	getGoodsWithoutPromotions(success, failed) {
		this.getData(
			`	SELECT * FROM Goods WHERE promotion IS NULL;`,
			[], success, failed
		);
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

	joinGoodsAndPromotion(promotion, success, failed) {
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

	filterGoodsByPromotion(promotion, success, failed) {
		this.getData(
			`
					SELECT *
				  	FROM Goods
					WHERE promotion = ?;
				  `,
			[promotion],
			success,
			failed
		);
	}

	createGoods(title, price, description, promotion, success, failed) {
		let query = this.db.prepare(`INSERT INTO Goods (title, price, description, image, promotion) VALUES (?, ?, ?, ?, ?);`);
		query.run([title, price, description, null, promotion], function(err) {
				if (err) {
					failed({detail: err});
				} else {
					success(this.lastID);
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
			], function(err) {
				if (err) {
					failed({detail: err});
				} else {
					success(this.lastID);
				}
			}
		);
	}

	deleteGoods(code, success, failed) {
		let query = this.db.prepare(`DELETE FROM Goods WHERE Goods.code = ?`);
		query.run([code], (err) => {
				if (err) {
					failed({detail: err});
				} else {
					success();
				}
			}
		);
	}

	getPromotions(success, failed) {
		this.getData(`SELECT id, percentage, comment FROM Promotions;`, [], success, failed);
	}

	createPromotion(percentage, comment, success, failed) {
		let query = this.db.prepare(`INSERT INTO Promotions (percentage, comment) VALUES (?, ?);`);
		query.run([percentage, comment], function(err) {
				if (err) {
					failed({detail: err});
				} else {
					success(this.lastID);
				}
			}
		);
	}

	getPromotionById(id, success, failed) {
		this.db.get(`SELECT * FROM Promotions WHERE id = ?`, [id], (err, data) => {
			if (err) {
				failed({detail: err});
			} else {
				success(data);
			}
		});
	}

	updatePromotion(item, success, failed) {
		let query = this.db.prepare(
			`UPDATE Promotions SET percentage = ?, comment = ? WHERE id = ?;`
		);
		query.run([
				item.percentage,
				item.comment,
				item.id
			], function(err) {
				if (err) {
					failed({detail: err});
				} else {
					success(this.lastID);
				}
			}
		);
	}

	deletePromotion(id, success, failed) {
		let query = this.db.prepare(`DELETE FROM Promotions WHERE id = ?`);
		query.run([id], function(err) {
				if (err) {
					failed({detail: err});
				} else {
					success(this.lastID);
				}
			}
		);
	}

	getCart(user_pk, success, failed) {
		this.db.get(`SELECT * FROM Carts WHERE user_id = ?`, [user_pk], (err, data) => {
			if (err) {
				failed({detail: err});
			} else {
				success(data);
			}
		});
	}

	createCart(user_pk, success, failed) {
		let query = this.db.prepare(`INSERT INTO Carts (user_id) VALUES (?);`);
		query.run([user_pk], function(err) {
				if (err) {
					failed({detail: err});
				} else {
					success(this.lastID);
				}
			}
		);
	}

	addGoodsToCart(cart_pk, goods_pk, amount, success, failed) {
		this.db.get(
			`SELECT * FROM GoodsCarts WHERE cart_id = ? AND goods_code = ?;`, [cart_pk, goods_pk],
			(err, data) => {
				if (err) {
					failed({detail: err});
				} else if (data) {
					let query = this.db.prepare(
						`UPDATE GoodsCarts SET amount = ? WHERE cart_id = ? AND goods_code = ?;`
					);
					query.run(
						[data.amount + amount, cart_pk, goods_pk],
						function(err) {
							if (err) {
								failed(err);
							} else {
								success(this.lastID, data.amount + amount);
							}
						}
					);
				} else {
					let query = this.db.prepare(`INSERT INTO GoodsCarts (goods_code, cart_id, amount) VALUES (?, ?, ?);`);
					query.run([goods_pk, cart_pk, amount], function(err) {
							if (err) {
								failed(err);
							} else {
								success(this.lastID, amount);
							}
						}
					);
				}
			}
		);
	}

	removeGoodsFromCart(cart_pk, goods_pk, amount, success, failed) {
		this.db.get(
			`SELECT * FROM GoodsCarts WHERE cart_id = ? AND goods_code = ?;`, [cart_pk, goods_pk],
			(err, data) => {
				if (err) {
					failed({detail: err});
				} else if (data) {
					if (data.amount - amount < 1) {
						let query = this.db.prepare(`DELETE FROM GoodsCarts WHERE cart_id = ? AND goods_code = ?;`);
						query.run([cart_pk, goods_pk], function(err) {
							if (err) {
								failed(err);
							} else {
								success(this.lastID, 0);
							}
						});
					} else {
						let query = this.db.prepare(
							`UPDATE GoodsCarts SET amount = ? WHERE cart_id = ? AND goods_code = ?;`
						);
						query.run(
							[data.amount - amount, cart_pk, goods_pk],
							function(err) {
								if (err) {
									failed(err);
								} else {
									success(this.lastID, data.amount - amount);
								}
							}
						);
					}
				} else {
					success({detail: 'goods not found in cart'});
				}
			}
		);
	}

	countGoodsAmountInUserCart(user_pk, success, failed) {
		this.db.get(`
			SELECT Count(GoodsCarts.amount) as goods_amount
			FROM Carts
			JOIN GoodsCarts ON GoodsCarts.cart_id = Carts.id
				AND Carts.user_id = ?;
		`, [user_pk], (err, data) => {
			if (err) {
				failed({detail: err});
			} else {
				let res = 0;
				if (data.goods_amount) {
					res = data.goods_amount;
				}
				success(res);
			}
		});
	}
}

module.exports = {
	Db: Db
};
