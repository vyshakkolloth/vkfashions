const mongoose = require("mongoose")


const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    order: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            require: true
        },
        price: {
            type: Number,
            require: true

        },
        totalprice: {
            type: Number,
            require: true
        },
        size: {
            type: String,
            require: false
        },
        quantity: {
            type: Number,
            require: true
        },


    }],


    orderStatus: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered'],
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        require: true
    },
    arrivingDate: {
        type: Date,
        require: true,

    },

    address: {
        type: Object,
        require: true
    },
    grandTotal: {
        type: Number,
        require: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'razorpay', 'wallet'],
        require: true
    },
    status: {
        type: String,
        enum: ['Active', 'Cancel'],
        default: 'Active'
    }
})
const orderModel = mongoose.model('order', orderSchema)
module.exports = orderModel