var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc = new Schema({
	news: { type: String },
	newscontent: { type: String },
	newsimg: { type: String },
	weizhi: { type: String },
	zhaiyao: { type: String },
	leixing: { type: String },
	paixu: { type: Number },
	date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('build3', sc);