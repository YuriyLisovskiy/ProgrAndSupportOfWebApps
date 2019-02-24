let express = require('express');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');

let router = require('./routes/index');

let app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/static', express.static('static'));

app.use('/', router);

app.use(function(req, res){
	res.status(404);
	if (req.accepts('json')) {
		res.send({ error: 'Not found' });
		return;
	}
	res.type('txt').send('Not found');
});

app.listen(3000, '127.0.0.1');
