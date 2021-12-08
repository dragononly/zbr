var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	user: {type:String},
	name: {type:String},
	phone:{type:String},
	exist:{type:String},
	message:{type:Object},
	pay:{type:Object},
	"pay.out_trade_no":{type:String,unique:true,sparse:true},
	register_date : {type: Date, default: Date.now}
});


module.exports = mongoose.model('store_list', sc);