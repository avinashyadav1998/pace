const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const alert = require('alert-node');   


const SendOtp = require('sendotp');    // send otp module
const sendOtp = new SendOtp('267901AZs5Pdf7z3mN5c8de229');   // auth key 



// db connections  db name is wt
const url = "mongodb://localhost:27017/pace"; 
mongoose.connect(url,{useNewUrlParser:true},()=>{
	console.log("db WT connected");
}) 

mongoose.set('useCreateIndex', true);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// ejs -> embeded java script 
app.set('view engine','ejs');  
/*  to tell express that look for ejs & it always render(looking for) 
	 views dir and try to fetch files form there 
*/

//middle ware 
app.use('/assets',express.static('public'));  
/* 1. whenever /assets url will come then express will search in public dir automatically */

// bodyParser for post requests to parse json data in xml
 var urlencodedParser = bodyParser.urlencoded({extended : true});


//------------routing -----------started ------
app.get("/",(req,res)=>{
	//console.log(__dirname);
	//res.sendFile(__dirname + '/views/fun.html');
	res.render('try');
});






app.get('/error',(req,res)=>{
	//res.sendFile(__dirname + '/views/error.html');
	res.render('404');
});

app.get('/pace2018',(req,res)=>{
	res.render('pace2018');
})

app.get('/signup',(req,res)=>{
	res.render('signup');
})


// user register
app.post('/signup',(req,res)=>{
	const newUser = new User();


	newUser.name = req.body.name;
	newUser.email = req.body.email;
	newUser.password = req.body.password;
	newUser.passOriginal = req.body.password;

	// crypt the password
	bcrypt.genSalt(10,(err,salt)=>{
		
		bcrypt.hash(newUser.password,salt,(err,hash)=>{
			if(err) return err;

			newUser.password = hash;  // hash contains crypted password

//now save the user with crypted password
		
		newUser.save().then(userSaved=>{
		 //res.send(userSaved);
		 res.render('try');
		 alert("sucessfully registered, now login using your credentials");
	    }).catch(err=>{
	    	console.log(err);
	    	alert('user_id alredy exit in database, Try again');
		   res.render('signup');
	        });
     }); 
   });
});



app.get('/signin',(req,res)=>{
	res.render('signin',{qs : req.query});
})


// user authorization and verification 
app.post('/signin',(req,res)=>{
		User.findOne({email : req.body.email}).then(userP=>{
			if(userP)
			{	
				
				console.log("valid email : ", userP.password);


				bcrypt.compare(req.body.password,userP.password,(err,matched)=>{
					if(err) return  err;

					if(matched)
					{
						//res.send("loign it is");
						console.log(userP.name);
						res.render('login',{qs : userP});
					}
					else
					{
						alert ("invaild password, try again");
						res.render('signin',{qs : userP});
					}
				});
			}
			else
			{
				console.log("wrong email");
				alert("invalid user_id, try again");
				res.redirect('signin');
			}
		}).catch(err=>{
			res.status(404).send(err);
		});
});



app.get("/contact",(req,res)=>{
	console.log(req.query);
	res.render('contact',{qs : req.query});
});

app.post("/contact",urlencodedParser,(req,res)=>{
	console.log(req.body);
	res.render('contact-success',{qs : req.body});
});



// view users from data base   , only admin can manage db
app.get('/admin_login',(req,res)=>{
	res.render('admin_login');
});

app.get('/admin',(req,res)=>{
	User.find({}).then(users=>{
		res.render('users',{qs : users});
	});
});



// -------- otp try it is ,  when user will forget password
let id= "";  //// global variable to keep user_id who forget password

app.get('/password',(req,res)=>{
	console.log(req.query);
	res.render('forgetpass',{mb : req.query });
});

app.post('/password',urlencodedParser,(req,res)=>{
	console.log(req.body);
	 id = req.body.userid;
	var x= '+91'+req.body.mobile;
	sendOtp.send(x,'AITait',(err,data)=>{
	console.log(data);
	res.render('otp',{otp : res.query});
});
});

// to varifying opt and sending back  password to user 

app.get('/wow',(req,res)=>{
	User.findOne({email : id}).then(userP=>{
		if(userP)
			{
				var p = userP.passOriginal;
				console.log('valid user & pass is :-', p);
				var p= 
				alert('password is :- '+p);
			}
		else
			console.log('invaild user');
		res.redirect('signin');
	});
});

/////// routing finished --------------//



//--------server code --------------------
const port = 1111 || process.env.PORT;
app.listen(port);
console.log("server is hosted at : ",port);




// NOTE:- password crypted dby BYCRYPTJS cann't be get back due to one way hashing











