require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});


const User = new mongoose.model("User", userSchema);


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
                bcrypt.compare(pass, foundUser.password, function(err, result) {
                    if(result === true){
                        res.render("secrets");
                    } else{
                        console.log("Email or pass incorrect.");
                    }
                    
                });
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

            bcrypt.hash(req.body.password, saltRounds, async(err, hash) => {
                try{
                    let mail = req.body.username;
                    let pass = hash;

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

            

        } catch(err){

            console.log(err);

        }
    });

//----------------------------------------------------------

app.listen(3000, function(){
    console.log('Get ready for secrets!');
});
