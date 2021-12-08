var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	user:{type:String,dropDups:true},
	information:{type:Object},
	store_name:{type:String,dropDups:true},
	date : {type: Date, default: Date.now}
	
	

});


module.exports = mongoose.model('jd_commodity_each', sc);