var mongoose = require('mongoose');

// // var dbURL ='mongodb://bobo:ilovexzb1314@mongo.meeoo.vip:27017,132.232.21.30:27017/user?replicaSet=rs';
var url = "mongodb://m2.moono.vip/myapp"

const options = {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useCreateIndex: true,
	auto_reconnect: true,
	bufferMaxEntries: 0,
	//poolSize: 10,
	user: 'bobo',
	pass: 'pp000000',
	keepAlive: 120,
	reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
}


mongoose.connect(url, options).then(
	(m) => {
		console.log("数据库连接成功"+url)
	},
	err => { /** handle initial connection error */ }
);


module.exports = mongoose;
