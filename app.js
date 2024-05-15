require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

const secret = process.env.SECRET;

userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']})

const User = new mongoose.model("User", userSchema);


app.get("/", function(req,res){
    res.render("home");
});

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
                }
            }


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

            let mail = req.body.username;
            let pass = req.body.password;

            const newUser = new User({
                email: mail,
                password: pass
            });

            await newUser.save();

            res.render("secrets");

        } catch(err){

            console.log(err);

        }
    });

//----------------------------------------------------------
app.listen(3000, function(){
    console.log('Get ready for secrets!');
});
