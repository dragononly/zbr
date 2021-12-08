var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc = new Schema({
	menu: { type: String },
	menu2: { type: String, unique: true, dropDups: true },
	srcarr: { type: Array },
	namearr: { type: Array },
	content: { type: String },
	news: { type: String },
	newscontent: { type: String },
	newsimg: { type: String },
	isshow: { type: String },
	date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('build2', sc);