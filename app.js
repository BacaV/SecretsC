require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session  = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose')

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Secretinho",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User", userSchema);

passport.use('user', User.createStrategy);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get("/", function(req,res){
    res.render("home");
});

//------------LOGIN ROUTE-------------

app.route("/login")
    .get(function(req, res){
        res.render("login");
    })
    .post(async(req, res) => {
        try{
            
            let user = req.body.username;
            let pass = req.body.password;

            let foundUser = await User.findOne({ email : user});

            if(foundUser){
                    if(foundUser.password === pass){
                        res.render("secrets");
                    } else{
                        console.log("Email or pass incorrect.");
                    }}
                
        } catch(err){

            console.log(err);

        }
    });

//----------REGISTER ROUTE--------------

app.route("/register")

    .get( async(req, res) => {
        try{
            res.render("register");
        } catch(err){
            console.log(err);
        }
    })

    .post(async(req, res) => {
        try{
            User.register({username: req.body.username}, req.body.password, function(err, user){
                if(err){
                    console.log(err);
                    res.redirect("/register");
                } else{
                    passport.authenticate("local")(req, res, function(){
                        res.redirect("/secrets");
                    })
                }
            })
                
        } catch(err){

            console.log(err);

        }
    });

//----------------------------------------------------------

app.get("/secrets", async(req, res) => {
    try{
        if(req.isAuthenticated()){
            res.render("secrets");
        } else {
            res.redirect("/login")
        }
    } catch(err){
        console.log(err);
    }
})

app.listen(3000, function(){
    console.log('Get ready for secrets!');
});
