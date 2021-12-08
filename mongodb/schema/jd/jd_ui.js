var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	index:{type:object},
	
});


module.exports = mongoose.model('jd_ui', sc);