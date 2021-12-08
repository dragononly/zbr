var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	_id2:{type:Number},
	usera:{type:String},
	userb:{type:String},
	aspect:{type:String},
	message:{type:String},
});


module.exports = mongoose.model('chat_index', sc);