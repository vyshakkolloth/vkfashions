const  mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
        
    },
    mobile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_verified:{
        type:Number,      
        default:0, 
        required:false 
    },
    access:{
        type:Boolean,
        default:true,
        required:true

    },
    address:[{
        firtName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        },
        E_mail:{
            type:String,
            required:true
        },
        MobileNo:{
            type:Number,
            required:true
        },
        Address_Line:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true

        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        zipCode:{
            type:Number,
            required:true
        }



    }],

    cart:[{
        products:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
            required:true
        },
        quantity:{
            type:Number,
            default:1,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        totalprice:{
            type:Number,
            required:true
        },
        size:{
            type:String,
            required:true
        },grandtotal:{
            type:Number,
            required:false
        }
    }],
    grandtotal:{
        type:Number,
        required:false
    },
    discount:{
        type:Number,
        required:false
    },
    wishlist:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
            requiured:true
        },
       

    }],
    wallet:{
        type:Number,
        default:0,
        required:false
    },
    
})
module.exports = mongoose.model('user',userSchema);