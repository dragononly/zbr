var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc = new Schema({
	abouttitle: { type: String },
	aboutcontent1: { type: String },
	aboutcontent2: { type: String },
	cpaddr: { type: String },
	cpphone: { type: String },
	cpemail: { type: String },
	cpbus: { type: String },
	cpcar: { type: String },
	cttitle: { type: String },
	ctkouhao: { type: String },
	ctbowuguan: { type: String },
	ctcpaddr: { type: String },
	ctcpphone: { type: String },
	ctcpemail: { type: String },
	bqcpname: { type: String },
	icp: { type: String },
	news: { type: String },
	newscontent: { type: String },
	ctcpphoneme: { type: String },
	paixu: { type: Number },
	newstype: { type: String },
	date: { type: Date, default: Date.now },
	newsimg: { type: String },
	zhaiyao: { type: String },
		date: { type: Date, default: Date.now },

});


module.exports = mongoose.model('build', sc);