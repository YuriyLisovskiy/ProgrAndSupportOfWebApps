let net = require('net');

let server = net.createServer(function (socket) {
	console.log('Client is connected!');
	socket.on('data', function (data) {
		let textChunk = data.toString('utf-8');
		console.log('Received from client: ' + textChunk);
		socket.write('Hello, Client!');
	});
	socket.on('end', function () {
		console.log('Client is disconnected!');
	});
});

server.listen(3000, 'localhost');
