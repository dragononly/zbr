var mongoose = require('../../db/db.js');

var Schema = mongoose.Schema;

var sc  = new Schema({
    department : {type:String},                   
    name: {type: String},                      
    phone:{type: String},                          
    manager:{type: String},      
    brand:{type: String},   
	model:{type: String}, 
	number:{type: String,unique:true,dropDups: true},                      
    admin:{type: String},
    type:{type: String}, 
    time : {type: Date, default: Date.now}
});


module.exports = mongoose.model('itman',sc);