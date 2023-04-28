const express = require('express')
const cartController = require('../controllers/cartController')
const userController = require("../controllers/userController")
const confiq = require('../config/config')
const auth = require('../middleware/auth')
const couponsController = require('../controllers/couponsController')



const user_route = express()


// auth or session
// user_route.use (session({secret:confiq.sessionSecret,cookie:{maxAge:60000*10},saveUninitialized:true,resave:false}))
//view engine
user_route.set('view engine', 'ejs')
user_route.set('views', "./views/users")
//converter
// user_route.use(bodyParser.json())
// user_route.use(bodyParser.urlencoded({extended:true}))



user_route.get('/', userController.loadHome)//,auth.isLogin
user_route.get('/register',userController.loadRegister)
user_route.post("/register", userController.insertUser)
user_route.get("/verification", userController.verificationLoad)
user_route.get("/verify", userController.verifyMail)
// user_route.get("/",auth.isLogOut,userController.loginLoad)
user_route.get('/login', userController.loginLoad)
user_route.post('/login', userController.verifyLogin)
user_route.get('/logout', auth.isLogin, userController.userLogout)
// user_route.get('/example',userController.example)
user_route.get("/otpPage", auth.isLogOut, userController.otpLogin)
user_route.post("/otpPage", userController.verifyOtpMail)
user_route.get("/otpValidate", auth.isLogOut, userController.enterOtp)
user_route.post("/otpValidate", userController.otpVerify)
user_route.get('/shop', userController.shop)
user_route.get('/detail', userController.productDetail)
user_route.get("/cart", userController.cart)//,auth.isLogin
user_route.post("/cart", auth.isLogin, userController.addCart)
user_route.get("/removeCart", auth.isLogin, userController.removeCart)
user_route.post("/increament", auth.isLogin, userController.increament)
user_route.post("/decreament", auth.isLogin, userController.decrement)
user_route.get("/wishListDisplay", auth.isLogin, userController.wishlist)
user_route.get("/wishList", userController.addWishlist)
user_route.get("/deletewishlist", auth.isLogin, userController.removeWishlist)
user_route.post("/proceedToCheckout", auth.isLogin, cartController.proceedToCheckout)
user_route.get("/checkout", auth.isLogin, cartController.checkout)//auth.isLogin,
user_route.get("/razorpay",auth.isLogin,cartController.razorpay)
// =====profile=====
user_route.get("/profile", auth.isLogin, userController.profile)
user_route.get("/editProfile", auth.isLogin, userController.editProfile)
user_route.post("/editProfile", auth.isLogin, userController.updateProfile)
user_route.get("/user-forgot-password",auth.isLogin, userController.editpassword)
user_route.post("/change-pass",auth.isLogin, userController.changePass)


// =======address=====
user_route.get("/address", auth.isLogin, userController.address)
user_route.get("/addAddress", auth.isLogin, userController.addAddress)
user_route.post("/addAddress", auth.isLogin, userController.addAddressPost)
user_route.get("/removeAddress", auth.isLogin, userController.removeAddress)
user_route.get("/editAddress", auth.isLogin, userController.editAddress)
user_route.post("/editAddress", auth.isLogin, userController.updateAddress) //


user_route.get("/sucessPage", auth.isLogin, cartController.sucess)
user_route.get("/myOrders", auth.isLogin, cartController.myOrders)
user_route.get("/cancelOrder",auth.isLogin,cartController.cancelOrder)
user_route.post("/checkoutAddres", auth.isLogin, cartController.addressLoader)
user_route.post("/coupon", auth.isLogin, couponsController.useCoupon)
user_route.post("/review", userController.review)

user_route.get("*", function (res, res) { res.render('404') })

module.exports = user_route
