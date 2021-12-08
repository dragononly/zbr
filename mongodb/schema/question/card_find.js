var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
	store:{type:String},
    data_card: {type: Array},                                             //solution
    data_card_user: {type: Array},  
    logindate : { type: Date},                                            //record datetime
});



module.exports = mongoose.model('question_card_find',sc);