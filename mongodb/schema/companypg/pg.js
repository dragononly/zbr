var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	column:{type:Object},
	article:{type:Object},
	banner:{type:Object},
	menu:{type:String},
	date : {type: Date, default: Date.now}
});


module.exports = mongoose.model('companypg', sc);