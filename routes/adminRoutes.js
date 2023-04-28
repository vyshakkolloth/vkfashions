    const express = require('express')
// const bodyParser = require('body-parser')
const config = require('../config/config');
const couponsController = require('../controllers/couponsController');
const cartController = require('../controllers/cartController');






const admin_Route = express()
// const session =require('express-session')
const confiq = require('../config/config')
///sstatic

admin_Route.use(express.static('../public/admin'));
//view engine
admin_Route.set("view engine", 'ejs')
admin_Route.set('views', "./views/admin")

//session
const adminAuth = require('../middleware/adminAuth')
const adminCOntroller = require('../controllers/adminController')


//parser
// admin_Route.use(bodyParser.json())
// admin_Route.use(bodyParser.urlencoded({extended:true}))
// multer

const upload = config.upload
const uploads=config.uploads


admin_Route.get('/', adminAuth.isLogOut, adminCOntroller.loadlogin)

admin_Route.post('/login', adminCOntroller.verify)
admin_Route.get('/home', adminAuth.isLogin, adminCOntroller.loadhome)
admin_Route.get('/logout', adminAuth.isLogin, adminCOntroller.adminlogout)
// admin_Route.get('/addUser', adminAuth.isLogin, adminCOntroller.addUser)
// admin_Route.post('/addUser', adminCOntroller.addNewUser)
//admin_Route.get("/edituser", adminAuth.isLogin, adminCOntroller.editUser)
// admin_Route.post("/edituser", adminCOntroller.updateUser)
// admin_Route.get('/deleteuser', adminAuth.isLogin, adminCOntroller.deleteUser)
admin_Route.get('/acess', adminAuth.isLogin, adminCOntroller.acess)
admin_Route.get('/category', adminAuth.isLogin, adminCOntroller.loadCategory)
admin_Route.post('/category', adminCOntroller.addCategory)
admin_Route.get('/deleteCategory', adminCOntroller.deleteCategory)
admin_Route.get('/userTable', adminAuth.isLogin, adminCOntroller.userTable)
admin_Route.get('/addProduct', adminAuth.isLogin, adminCOntroller.addProduct)//
admin_Route.post('/addProduct', upload.array("image"), adminCOntroller.addProductPost)
admin_Route.get('/productList', adminAuth.isLogin, adminCOntroller.productList) //
admin_Route.get("/deletephoto", adminAuth.isLogin, adminCOntroller.deletePhoto)
admin_Route.get('/productDelete', adminAuth.isLogin, adminCOntroller.productDelete)
admin_Route.get("/editProduct", adminCOntroller.editProduct)//adminAuth.isLogin,
admin_Route.post("/editProduct", upload.array("image"), adminAuth.isLogin, adminCOntroller.updateProduct)

admin_Route.get("/orderManagment", adminAuth.isLogin, adminCOntroller.orderManagment)
admin_Route.get("/orderDetails", adminAuth.isLogin, cartController.adminorderDetail)

admin_Route.get("/bannerManagement", adminAuth.isLogin, adminCOntroller.bannerManagment)
admin_Route.post("/bannerManagement", uploads.single("image"), adminAuth.isLogin, adminCOntroller.uploadBannerManagment)
admin_Route.get("/deleteBanner", adminAuth.isLogin, adminCOntroller.deleteBanner)

admin_Route.post("/approval", adminAuth.isLogin, adminCOntroller.approval)

admin_Route.get("/coupons", adminAuth.isLogin, couponsController.couponsProfile)
admin_Route.post("/addcoupon", adminAuth.isLogin, couponsController.addCoupon)
admin_Route.get("/couponDelete", adminAuth.isLogin, couponsController.deleteCoupon)
admin_Route.get("/salesReport",adminAuth.isLogin, adminCOntroller.salesReport)
admin_Route.get("*", function (res, res) { res.render('404') })
module.exports = admin_Route 
