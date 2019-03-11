const secret = 'secret_key';
const dbPath = './shop.db';
const dbModule = require('./db');

let db = null;
if (!db) {
	db = new dbModule.Db(dbPath);
}

module.exports = {
	SecretKey: secret,
	Db: db
};
