const WebSocket = require('ws');
wss.on('connection', function (ws, req) {
	//const ip = req.connection.remoteAddress;
	ws.on('message', function (message) {
		console.log('websocket' + message);
		let order = 'ip address';
		order = message
		wss.clients.forEach(function each(client) {
			var Client = require('ssh2').Client;
			var conn = new Client();
			conn.on('ready', function () {
				console.log('Client :: ready');
				conn.exec(order, function (err, stream) {
					if (err) throw err;
					stream.on('close', function (code, signal) {
						console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
						conn.end();
					    client.send('结束');
					}).on('data', function (data) {
						//data=JSON.stringify(data)
						data = String(data)
						console.log('STDOUT: ' + data);
						client.send(data);
					}).stderr.on('data', function (data) {
						console.log('STDERR: ' + data);
						data = String(data)
						client.send(data);
					});
				});
			}).connect({
				host: 'any.moono.vip',
				port: 27017,
				username: 'admin',
				password: 'mm000000'
			});
			function ca(data) {
				res.json(data)
			}


		});

	});

	ws.on('open', function open() {
		console.log('opened')
		ws.send('i am open');
	});
	//ws.send('something');

	ws.on('close', function close() {
		console.log('disconnected');
	});


});






    	// Broadcast to all.

//wss.broadcast = function broadcast(data) {
//wss.clients.forEach(function each(client) {
//	console.log(client)
//	
//  if (client.readyState === WebSocket.OPEN) {
//    client.send("data");
//  }
//});
//
//client.send("data");
//};