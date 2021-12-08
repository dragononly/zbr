var server = require('http').createServer();
var io = require('socket.io')(server);






var io = io.listen(server);

	io.sockets.on('connection', function (socket) {
		console.log('连接成功');
		socket.on('click1',function(){
			console.log('监听点击事件');
			var datas = [1,2,3,4,5];
			socket.emit('click2', {datas: datas});
      socket.broadcast.emit('click2',  {datas: datas});
		})
	})





//const IO = require('koa-socket-2');
//
//const io = new IO();
//
//io.on('message', (ctx, data) => {
//console.log('client sent data to message endpoint', data);
//});
