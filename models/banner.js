const mongoose = require("mongoose")

const banner = new mongoose.Schema({
    image:{
        type:String,
        required:true
    },title1:{
        type:String,
        required:false
    },title2:{
        type:String,
        required:false
    }
   

})


module.exports= mongoose.model('banners',banner)