const mongoose = require("mongoose")

const review = new mongoose.Schema({
    review:{
        type:String,
        required:true
    },name:{
        type:String,
        required:false
    },email:{
        type:String,
        required:false
    },
    datee:{
        type:Date,
        required:false
    }, product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        require: true
    }

})


module.exports= mongoose.model('review',review)