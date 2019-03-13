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
  username      VARCHAR(100)  PRIMARY KEY,
  email         VARCHAR(255)  NOT NULL,
  password      VARCHAR(100)  NOT NULL,
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
  user              VARCHAR(100)  UNIQUE,
  goods_number      INTEGER       DEFAULT 0,

  FOREIGN KEY(user) REFERENCES Users(username)
);

CREATE TABLE IF NOT EXISTS GoodsCarts (
  goods_code  INTEGER NOT NULL,
  cart_id     INTEGER NOT NULL,
  amount      INTEGER DEFAULT 1,

  FOREIGN KEY(goods_code) REFERENCES Goods(code),
  FOREIGN KEY(cart_id) REFERENCES Carts(id),

  PRIMARY KEY (goods_code, cart_id)
);

CREATE TRIGGER IF NOT EXISTS GoodsAddToCartTrigger
  AFTER INSERT
  ON GoodsCarts
  FOR EACH ROW
  BEGIN
	UPDATE Carts
	SET goods_number = goods_number + ABS(goods_number - NEW.amount)
    WHERE Carts.id = NEW.cart_id;
  END;

CREATE TRIGGER IF NOT EXISTS GoodsDecreaseAmountTrigger
  AFTER UPDATE
  ON GoodsCarts
  FOR EACH ROW
  WHEN OLD.amount > NEW.amount
  BEGIN
    UPDATE Carts
    SET goods_number = goods_number - ABS(goods_number - NEW.amount)
    WHERE Carts.id = NEW.cart_id;
  END;

CREATE TRIGGER IF NOT EXISTS GoodsIncreaseAmountTrigger
  AFTER UPDATE
  ON GoodsCarts
  FOR EACH ROW
  WHEN OLD.amount < NEW.amount
  BEGIN
    UPDATE Carts
    SET goods_number = goods_number + ABS(goods_number - NEW.amount)
    WHERE Carts.id = NEW.cart_id;
  END;

CREATE TRIGGER IF NOT EXISTS GoodsRemoveFromCartTrigger
  AFTER DELETE
  ON GoodsCarts
  FOR EACH ROW
  BEGIN
    UPDATE Carts
    SET goods_number = 0
    WHERE Carts.id = OLD.cart_id;
    END;
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

	getAllGoods(user_pk, success, failed) {
		this.getData(`
			SELECT Goods.code, Goods.title, Goods.price, Goods.description,
			       Promotions.percentage as discount_percentage,
			       GoodsCarts.goods_code IS NOT NULL as is_in_cart
			FROM Goods
			LEFT JOIN Promotions ON Promotions.id = Goods.promotion
			LEFT JOIN GoodsCarts ON GoodsCarts.goods_code = Goods.code
			LEFT JOIN Carts ON Carts.id = GoodsCarts.cart_id AND Carts.user = ?
		`, [user_pk], success, failed);
	}

	getGoodsWithoutPromotions(success, failed) {
		this.getData(
			`	SELECT code, title, price, description FROM Goods WHERE promotion IS NULL;`,
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
					SELECT code, title, price, description, image, promotion
				  	FROM Goods
					WHERE promotion = ?;
				  `,
			[promotion],
			success,
			failed
		);
	}

	createGoods(title, price, description, promotion, success, failed) {
		let query = this.db.prepare(`INSERT INTO Goods (title, price, description, promotion) VALUES (?, ?, ?, ?);`);
		query.run([title, price, description, promotion], function(err) {
				if (err) {
					failed(err);
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
					failed(err);
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

	createPromotion(percentage, comment, success, failed) {
		let query = this.db.prepare(`INSERT INTO Promotions (percentage, comment) VALUES (?, ?);`);
		query.run([percentage, comment], function(err) {
				if (err) {
					failed(err);
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
					failed(err);
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
					failed(err);
				} else {
					success(this.lastID);
				}
			}
		);
	}

	getCart(user_pk, success, failed) {
		this.db.get(`SELECT * FROM Carts WHERE user = ?`, [user_pk], (err, data) => {
			if (err) {
				failed({detail: err});
			} else {
				success(data);
			}
		});
	}

	createCart(user_pk, success, failed) {
		let query = this.db.prepare(`INSERT INTO Carts (user) VALUES (?);`);
		query.run([user_pk], function(err) {
				if (err) {
					failed(err);
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
								success(this.lastID);
							}
						}
					);
				} else {
					let query = this.db.prepare(`INSERT INTO GoodsCarts (goods_code, cart_id, amount) VALUES (?, ?, ?);`);
					query.run([goods_pk, cart_pk, amount], function(err) {
							if (err) {
								failed(err);
							} else {
								success(this.lastID);
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
								success(this.lastID);
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
									success(this.lastID);
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
}

module.exports = {
	Db: Db
};
