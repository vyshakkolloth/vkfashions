const express = require("express");
const { default: mongoose } = require("mongoose");
const nocache = require("nocache");
const session =require('express-session')
const dotenv = require("dotenv");
dotenv.config({path:"./config.env"})
const confiq=require('./config/config')
const bodyParser = require('body-parser')

const app=express();
const path = require("path");

app.use(express.static(path.join(__dirname, 'public')));

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use (session({secret:confiq.sessionSecret,cookie:{maxAge:60000*10},saveUninitialized:true,resave:false}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))



let logger = require('morgan');

app.use(nocache())



mongoose.set('strictQuery',true)
mongoose.connect("mongodb://127.0.0.1:27017/example").then(console.log("connected"))

// for user route
const user_Route=require('./routes/userRoutes')
const admin_Route=require('./routes/adminRoutes')
app.use("/admin",admin_Route)

app.use("/",user_Route)
app.use(logger('dev'));


app.listen(process.env.PORT,()=>{
    console.log("server connected")
})