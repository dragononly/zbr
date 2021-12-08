var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	NoteNameC2:{type:String},
	NoteName:{type:String},
	User:{type:String},
	NoteNameC:{type:String},
	Imgicon:{type:String},
	date : {type: Date, default: Date.now}
});

module.exports = mongoose.model('skynote', sc);