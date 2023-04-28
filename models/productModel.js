const mongoose=require("mongoose")
const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    pPrice:{
        type:String,
        required:true
    },
    selling:{
        type:Number
        ,required:true
    },
    image:{
        type:Array
        //, required:false
    },
    quantity:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
     },
    brand:{
        type:String,
        required:true
    },
    size:{
        type:Array,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
    
         required:true
    }, access:{
        type:Boolean,
        default:true
       

    }
})


module.exports=mongoose.model('product',productSchema)