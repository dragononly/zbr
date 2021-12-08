var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	grade1: {type:String, unique:true, dropDups:true},
	child:  {type:Array},
	

});


module.exports = mongoose.model('commodity_list', sc);