var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	store:{type:String},
    data: {type: Array},                                             //solution
    logindate : { type: Date},                                            //record datetime
});



module.exports = mongoose.model('question_depot',sc);