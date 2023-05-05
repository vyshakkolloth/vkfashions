const applyCoupon = async(req,res)=>{

    try {
        if(req.body.coupon){
            const userId = req.session.user_Id
            const couponId =  req.body.coupon

            const coupon = await Coupon.findOne({_id : couponId})
            const userCart = await Cart.findOne({UserId : userId})
                
            if (coupon) {
                if(userCart.coupon){
                    await Coupon.updateOne({ _id : userCart.coupon },{ $pull: { users: userCart.UserId }});
                }
                const index = coupon.users.findIndex(item => item.equals(userId));
                if(index == -1){
                    console.log(userCart,coupon);
                    const couponDiscount = (coupon.discount / 100)

    
                        if (userCart.GrandTotal >= coupon.minPurchaseAmount) {
    
                            if (userCart.GrandTotal * couponDiscount > coupon.maxDiscountAmount) {
    
                                const grand = coupon.maxDiscountAmount
    
                                await Cart.updateOne({UserId:userId},{$set:{discount:grand,coupon:coupon._id}})
                                
                                await Coupon.updateOne({ _id: couponId },{ $push: { users: userCart.UserId }});
                                
                                res.send({sucsses:true,message:'coupon applyed successfully'})
    
                            }else{
    
                                const grand = userCart.GrandTotal * couponDiscount
    
                                await Cart.updateOne({UserId:userId},{$set:{discount:grand,coupon:coupon._id}})
    
                                await Coupon.updateOne({ _id: couponId },{$push: { users:  userCart.UserId  }});
                                res.send({sucsses:true,message:'coupon applyed successfully '})
                        
                            }
                            
                        }else{
    
                            message = "minimum purchase not met"
    
                            console.log(message);
                            res.send({sucsses:false,message:'minimum purchase not met'})
                        }

            }else{
                res.send({sucsses:false,message:'you alredy use this coupon onces'})
            }                                  
        }else {
    
                message = "coupon expired or not valid"

                console.log(message);
                res.send({sucsses:false,message:'coupon expired or not valid'})
            }
    }else{
        res.send({sucsses:false,message:'coupon not fount'})

    }    
    } catch (error) {
        console.log(error.message);
    }
}


// =====coupon===== ujuall=========
const useCoupon = async (req, res) => {
    try {
      const couponId = req.body.couponId;
      const subTotal = req.body.subtotal;
      const couponData = await couponSchema.findOne({ couponId: couponId });
      const userid = req.session.user_id;
  
      if (couponData) {
        const min = couponData.minAmount;
        const max = couponData.maxAmount;
        const Avg = (min + max) / 2;
        let discount = couponData.discount;
        const maxDiscount = couponData.max_discount;
        let discountSubtotal;
        let messa;
  
        const checkUser = await couponSchema.findOne({ ref: userid, couponId: couponId });
        if (checkUser) {
          let wrong = 1;
          discountSubtotal = subTotal;
          discount = (discount - discount);
          messa = 'already used';
          res.status(200).send({ messa, wrong, discountSubtotal, discount });
        } else {
           const couponDate = new Date(couponData.expiryDate)
          // // console.log(couponDate,new Date())
          const currentDate = new Date() 
  
         
            if(currentDate<couponDate){
            if (min <= subTotal) {
              if (subTotal <= Avg) {
                discountSubtotal = (subTotal * (1 - (couponData.discount) / 100)).toFixed(0);
              let userSchema = await User.findByIdAndUpdate(userid, {  grandtotal: discountSubtotal })
                messa = 'added';
                res.status(200).send({ discountSubtotal, discount, messa });
              } else {
                discountSubtotal = (subTotal * (1 - (couponData.max_discount) / 100)).toFixed(0);
              let userSchema = await User.findByIdAndUpdate(userid, {  grandtotal: discountSubtotal })
                messa = 'added';
                res.status(200).send({ discountSubtotal, maxDiscount, messa });
              }
            } else {
              messa = 'Min Amount for this coupon is ' + couponData.minAmount;
              discountSubtotal = subTotal;
              discount = "0"
              res.status(200).send({ messa, discountSubtotal, discount });
            }
          } else {
          const updateCoupon =  await couponSchema.updateOne({couponId:couponId},{$set:{status:'Expired'}})
          console.log(updateCoupon);
            messa = 'Coupon Expired';
            discountSubtotal = subTotal;
            discount = '0'
            res.status(200).send({ messa, discountSubtotal, discount });
          }
        }
        const usedCoupon = await couponSchema.findOneAndUpdate({ couponId: couponId }, { $set: { ref: userid } });
      } else {
        // Handle case when couponData is null
        console.log('Coupon data not found');
        res.status(404).send({ message: 'Coupon not found' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'Internal server error' });
    }
  };