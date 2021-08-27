
const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const mongoose=require('mongoose');

const session=require('express-session')

const app=express();
app.use(bodyParser.urlencoded({
    extended:true
}));




const passport=require('passport');

const facebookStrategy=require('passport-facebook').Strategy;

const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(session({secret:"THISISMYSECRETKEY"}));


var facebookid="";


passport.use(new facebookStrategy({
clientID:"354191059764159",
clientSecret:"4a1d34cb8b98f3ee7f966a648db4f399",
callbackURL:"http://localhost:8080/facebook/callback",
profileFields:['id','displayName','name','gender']},

function(token,refreshToken,profile,done){
    console.log(profile);
    facebookid=profile.id;
   
    
    return done(null,profile)

}
));

//Initialising GoogleStrategy for google oauth
passport.use(new GoogleStrategy({
    clientID:"1091011100781-hj8ekfivu3jfuti4mia5q4ujcv5vsm3d.apps.googleusercontent.com",
    clientSecret:"Jc6dCYy5e2yN1wndFMcIyZN1",
    callbackURL: "http://localhost:8080/google/callback",
    profileFields:['id','displayName','name','gender']
    
    
},
function(token,refreshToken,profile,done){
    console.log(profile);
    return done(null,profile)

}
));
//Serialising and deserialising users--Just a formality!!!
passport.serializeUser(function(user,done){
    done(null,user);
});
passport.deserializeUser(function(id,done){
    User.findById('id',function(err,user){
        done(err,user);
    });
});


//Connecting with mongoose--Important!!
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true}, { useUnifiedTopology: true });
//Declaring our Schema- A model for storing data basically
const userSchema={
    email:String,
    password: String,
    college:String,
    contact:String,
    namesaved:String,
    fbid:String
};

//Declaring a collection which stores the data
const User = new mongoose.model("User",userSchema);
//All routes - we can wrap them up in  a separate JS file!

app.get('/',(req,res)=>{
    res.render('home');
});
//Facebook
app.get('/auth/facebook',passport.authenticate('facebook',{scope:'email'}));

app.get('/facebook/callback',passport.authenticate('facebook',{
    
    successRedirect:'/verify',
    failureRedirect:'/failed'
    
}));

//Google
app.get('/auth/google',passport.authenticate('google',{scope:'email'}));
app.get('/google/callback',passport.authenticate('google',{
   
    successRedirect:'/UserCredentials',
    failureRedirect:'/failed'
}));


app.get("/verify",(req,res)=>{
    User.findOne({fbid:facebookid},function(err,foundUser){
        if(err){
            res.send("Register your facebook id")
        }
        else{

            if(foundUser){
              res.redirect("secrets");
            }
            else{
               
                res.redirect('/register');
            }
        }
    });

});

//Views 
app.get('/secrets',(req,res)=>{
    res.render('secrets');

});

app.get('/failed',(req,res)=>{
    res.send('Failed');
    });
app.get('/login',(req,res)=>{
    res.render('login');
});
app.get('/register',(req,res)=>{
    res.render('register');
});
app.get('/logout',(req,res)=>{
    res.render("home");
})

app.get('/UserCredentials',(req,res)=>{
    res.render('UserCredentials');
})





//Post requests

app.post("/register",(req,res)=>{
   
    const newUser= new User({
        email:req.body.username,
        password:req.body.password,
        college:req.body.college,
        contact:req.body.contact,
        namesaved:req.body.namesaved,
        fbid:"null"
    });
    //Saving data to mongoDB!
    newUser.save((err)=>{
        if(err){
            console.log('Error');
        }
        else{
            res.redirect("/secrets");
            
            
           
        }
    });
});


app.get('/user',(req,res)=>{
    res.redirect("/UserCredentials");

});

app.post("/login",function(req,res){
    const username=req.body.username;
    const password=req.body.password;
   
    
    User.findOne({email:username},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{

            if(foundUser){
                if(foundUser.password===password){
                    res.render("secrets");
                    
                }
                else{
                   res.send("Invalid Username and Password")
                }
            }
            
        }
    });
});

app.post("/UserCredentials",(req,res)=>{
    const Username=req.body.User_Name;
    const email=req.body.User_email;
    const College=req.body.College_name;
    const UserContact=req.body.User_contact;
    const newUser= new User({
        email:email,
        password:"",
        college:College,
        contact:UserContact,
        namesaved:Username,
        fbid:facebookid
    });
    
    newUser.save((err)=>{
        if(err){
            console.log('Error');
        }
        else{
            res.redirect("/auth/facebook");
            
           
        }
    });
    

});
app.post("/facebooklogin",async(req,res)=>{

    res.redirect("/auth/facebook");

})


app.post("/temporary",(req,res)=>{
    res.render("facebook");

});


//Finally server has to listen!
app.listen(8080,(req,res)=>{
    console.log(8080);
});
