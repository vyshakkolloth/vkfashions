// const express = require('express')
const Razorpay = require('razorpay')

const orderModel = require('../models/orderModel')
const productModel = require('../models/productModel')
const User = require('../models/userModel')
const categorySchema = require('../models/category')
const mongoose = require('mongoose')
const couponsSchema = require('../models/couponsSchema')
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" })


let { ObjectId } = mongoose.Types


var instance = new Razorpay({
    key_id: process.env.RAZO,  //'rzp_test_A2tpP62NDFg7Wm',
    key_secret: process.env.RAZOKEY//'w8SOXbzEkkxQlN6O5mHQKGCX',
});

let sweat_alert
const checkout = async (req, res) => {
    try {
        const category = await categorySchema.find
        const id = req.session.user_id 
        const userData = await User.findById({ _id: id }).populate("cart.products")
        const coupons= await couponsSchema.find()

        let address = userData.address[0]
        const order = req.session.order

        //   console.log(address);

        res.render("checkout", { sweat_alert, category, user: userData, add: address, order ,coupons})
        req.session.order = null
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
}
// ===checkout===
const proceedToCheckout = async (req, res) => {
    try {
        const id = req.session.user_id 


        const { select, fname, lname, email, Mobile, address, country, city, state, zipCode, payment } = req.body


        const updatedAddress = {
            firtName: fname,
            lastName: lname,
            E_mail: email,
            MobileNo: Mobile,
            Address_Line: address,
            country: country,
            city: city,
            state: state,
            zipCode: zipCode
        };


        if (select !== "addnewbill") {

            const result = await User.updateOne(
                { _id: id, "address._id": select },
                { $set: { "address.$": updatedAddress } }
            );

        } else {
            const data = await User.findByIdAndUpdate({ _id: id }, { $push: { address: { firtName: fname, lastName: lname, E_mail: email, MobileNo: Mobile, Address_Line: address, country: country, city: city, state: state, zipCode: zipCode } } })

        }

        const user = await User.findById(id).populate("cart.products");

        var currentDate = new Date();

        // add 5 days to the current date
        var increasedDate = new Date(currentDate.setDate(currentDate.getDate() + 5));


        const order = new orderModel({
            user: user._id,
            order: user.cart.map((item) => ({
                product: item.products,
                price: item.price,
                totalprice: item.totalprice,
                size: item.size,
                quantity: item.quantity,
            }
            )),
            orderStatus: "Pending",
            orderDate: currentDate,
            arrivingDate: increasedDate,
            address: updatedAddress,
            grandTotal: user.grandtotal,
            paymentMethod: req.body.payment,
            status: "Active"
        });

        // ==========================cod=================
        if (req.body.payment == "cod") {
            await order.save();
            const orderId = order._id;



            user.cart.forEach(async (item) => {
                // console.log(item+" ===== ");
                const product = await productModel.findOneAndUpdate(
                    { _id: item.products },
                    { $inc: { quantity: -item.quantity } }
                );
            });

            user.cart = [];
            await user.save();
            await User.findByIdAndUpdate({ _id: id }, { $unset: { grandtotal: "", discount: "" } })

            // res.redirect(req.headers.referer);
            res.redirect(`/sucessPage?id=${orderId}`);
        } else
            //====== razopay======
            if (req.body.payment == "razorpay") {
                var options = {
                    amount: order.grandTotal * 100,  // amount in the smallest currency unit//
                    currency: "INR",
                    receipt: "order_rcptid_11"
                };
                const orderss = await instance.orders.create(options)

                req.session.order = orderss
                req.session.orderdata = updatedAddress
                res.redirect("/checkout")

            } else if (req.body.payment == "wallet") {
                await order.save();
                const orderId = order._id;



                user.cart.forEach(async (item) => {
                    // console.log(item+" ===== ");
                    const product = await productModel.findOneAndUpdate(
                        { _id: item.products },
                        { $inc: { quantity: -item.quantity } }
                    );
                });

                user.cart = [];
                await user.save();
                await User.findByIdAndUpdate({ _id: id }, { $unset: { grandtotal: "", discount: "" } })
                const updateWallet = await User.updateOne({ _id:id }, { $inc: { wallet: -user.grandtotal } })


                // res.redirect(req.headers.referer);
                res.redirect(`/sucessPage?id=${orderId}`);

            }


    } catch (error) {
        res.status(500).send('Server Error');

        console.log(error)
    }
}

const razorpay = async (req, res) => {

    // =======
    const id = req.session.user_id 
    const user = await User.findById(id).populate("cart.products");
    const updatedAddress = req.session.orderdata

    var currentDate = new Date();

    // add 5 days to the current date
    var increasedDate = new Date(currentDate.setDate(currentDate.getDate() + 5));


    const order = new orderModel({
        user: user._id,
        order: user.cart.map((item) => ({
            product: item.products,
            price: item.price,
            totalprice: item.totalprice,
            size: item.size,
            quantity: item.quantity,
        }
        )),
        orderStatus: "Pending",
        orderDate: currentDate,
        arrivingDate: increasedDate,
        address: updatedAddress,
        grandTotal: user.grandtotal,
        paymentMethod: 'razorpay',
        status: "Active"
    });
    // =======

    await order.save();
    const orderId = order._id;




    user.cart.forEach(async (item) => {
       
        const product = await productModel.findOneAndUpdate(
            { _id: item.products },
            { $inc: { quantity: -item.quantity } }
        );
    });

    user.cart = [];
    await user.save();
    await User.findByIdAndUpdate({ _id: id }, { $unset: { grandtotal: "", discount: "" } })
    res.json(orderId)

}






const addressLoader = async (req, res) => {
    try {

        const id = req.session.user_id
        const userData = await User.findById({ _id: id }) 

        const address = userData.address.id(req.body.value);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.json(address);




    } catch (error) {
        res.status(500).send('Server Error');
        console.error(error)
    }
}

const sucess = async (req, res) => {
    try {


       
       
        // console.log(req.query + " order id")
        const id = req.query.id

        const data = await orderModel.findById(id).populate('order.product')
    


        res.render("ordersucess", { data })
    } catch (error) {
        res.status(500).send('Server Error');

        console.log(error.message)
    }
}
const myOrders = async (req, res) => {
    try {
        const id = req.session.user_id 
        const user = await User.findOne({ _id: id })
        const orders = await orderModel.find({ user: user._id }).populate('order.product').populate('user')
       
        const category = null
        res.render("myorders", { category: category, order: orders })
    } catch (error) {
        res.status(500).send('Server Error');
    }
}
const cancelOrder = async (req, res) => {
    try {
        const id = req.query.id
        // console.log(req.query)
        const a = await orderModel.findById({ _id: id })
        const updateOne = await orderModel.updateOne({ _id: id }, { $set: { status: "Cancel" } })
        // console.log(a);
        // res.redirect("/myOrders"
        const updateWallet = await User.updateOne({ _id: a.user }, { $inc: { wallet: a.grandTotal } })

        res.redirect(req.headers.referer);

    } catch (error) {
        console.error(error)
        res.status(500).send('Server Error');
    }
}
// =======admin side
const adminorderDetail = async (req, res) => {
    try {
      
        const id = req.query.id

        let data = await orderModel.findById(id).populate("user").populate("order.product")

        res.render("orderDetails", { data })

    } catch (error) {
        res.status(500).send('Server Error');
        console.error(error)

    }
}



module.exports = {
    checkout,
    proceedToCheckout, razorpay,
    sucess,
    myOrders, cancelOrder,
    addressLoader,
    adminorderDetail
}