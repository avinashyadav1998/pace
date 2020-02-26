const mongoose = require("mongoose");
const Schema = mongoose.Schema;




const userSchema = new Schema({
	
	name: {		required : true,
				type : String,
				minlength: 5
	
	},
	email: {
				required : true,
				type : String,
				unique : true,
				trim : true,
				minlength: 5

	},
	password: {
				required : true,
				type : String,
				minlength : 5

	},
	passOriginal: {
		type : String,
	}
});


module.exports = mongoose.model('students',userSchema);

