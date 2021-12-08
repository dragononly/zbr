var mongoose = require('../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	Menu1 : {type:String},
	Menu2 : {type:String},
	NewsName : {type:String},
	User : {type:String},
	Type : {type:String},
	Authority :{type:String},
	Content :{type:String},
	date : {type: Date, default: Date.now}
});


module.exports = mongoose.model('new', sc);