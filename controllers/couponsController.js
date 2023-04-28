const express = require('express')
const orderModel = require('../models/orderModel')
const productModel = require('../models/productModel')
const User = require('../models/userModel')



const mongoose = require('mongoose')
const couponSchema = require('../models/couponsSchema')
let message


let { ObjectId } = mongoose.Types
let sweat_alert

const couponsProfile=async(req,res)=>{
    try {
        const couponDetails = await couponSchema.find({})
        res.render("coupons",{couponDetails,sweat_alert})

        sweat_alert=null
    } catch (error) {
        console.log(error)
    }
}
const addCoupon = async(req,res)=>{
    try {
        const {couponId,expiryDate,minAmount,maxAmount,discount,maxdiscount,couponName}=req.body
        // console.log(couponId)
        
        const couponDetails = await couponSchema.findOne({couponName:couponName})
       if(couponDetails){
        console.log("hehe")
        sweat_alert="exist"
        res.redirect(req.headers.referer);
       }else{

    
             const couponData = new couponSchema({
                couponName:couponName,
                couponId:couponId,
                expiryDate:expiryDate,
                maxAmount:minAmount,
                minAmount:maxAmount,
                discount:discount,
                max_discount:maxdiscount
             })
            const details = await couponData.save()
            console.log(details)

            res.redirect(req.headers.referer);
            }
       

    } catch (error) {
        
    }
}
// delete coupon====
const deleteCoupon = async(req,res)=>{
    try {
        const couponId = req.query.id
        await couponSchema.deleteOne({_id:couponId})
        res.redirect(req.headers.referer);

        console.log(couponDetails)
    } catch (error) {
        
    }
}
//                                                  ==========user SIDE CONTROLLER=========
const useCoupon = async (req, res) => {
    try {
      const couponId = req.body.couponId
      const subTotal = req.body.subtotal
      const couponData = await couponSchema.findOne({ couponId: couponId });
      const userid = req.session.user_Id
  
      if (!couponData) {
        const messa = 'invalid coupon'
        const discountSubtotal = subTotal
        const discount = 0
        res.status(200).send({ messa, discountSubtotal, discount })
        return
      }
  
      const min = couponData.minAmount
      const max = couponData.maxAmount
      const Avg = (min + max) / 2
      let discount = couponData.discount;
      const maxDiscount = couponData.max_discount
      let discountSubtotal
      let messa
      const checkUser = await couponSchema.findOne({ ref: userid, couponId: couponId })
  
      if (checkUser) {
        const wrong = 1
        discountSubtotal = subTotal
        messa = 'Coupon already used'
        res.status(200).send({ messa, wrong, discountSubtotal, discount })
      } else {
        if (couponData.expiryDate <= Date.now) {
          if (min <= subTotal) {
            if (subTotal <= Avg) {
              discountSubtotal = (subTotal * (1 - (couponData.discount) / 100)).toFixed(0);
              let userSchema = await User.findByIdAndUpdate(userid, {  grandtotal: discountSubtotal })
              messa = 'Coupon added'
              res.status(200).send({ discountSubtotal, discount, messa })
            } else {
              discountSubtotal = (subTotal * (1 - (couponData.max_discount) / 100)).toFixed(0)
              let userSchema = await User.findByIdAndUpdate(userid, {  grandtotal: discountSubtotal  })
              messa = 'Coupon added'
              res.status(200).send({ discountSubtotal, maxDiscount, messa })
            }
          } else {
            messa = 'Min Amount for this coupon is ' + couponData.minAmount
            discountSubtotal = subTotal
            discount = 0
            res.status(200).send({ messa, discountSubtotal, discount })
          }
        } else {
          messa = 'Coupon Expired'
          discountSubtotal = subTotal
          discount = 0
          res.status(200).send({ messa, discountSubtotal, discount })
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

module.exports = {
    couponsProfile,addCoupon,deleteCoupon,useCoupon
    
}
