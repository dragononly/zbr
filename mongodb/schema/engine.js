var mongoose = require('../db/db.js');

var Schema = mongoose.Schema;

var sc = new Schema({
	Menu: { type: String },
	NewsName: { type: String },
	User: { type: String },
	Type: { type: String },
	Authority: { type: String },
	Content: { type: String },
	comment: { type: Object },
	myid: { type: String },
	date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('engine', sc);