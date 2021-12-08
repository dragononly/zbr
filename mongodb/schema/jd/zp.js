var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	xf:{type:Object}
});


module.exports = mongoose.model('zp', sc);