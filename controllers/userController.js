const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const productModel = require("../models/productModel");
const categorySchema = require("../models/category");
const { acess } = require("./adminController");
// const cartModel = require("../models/cartModel");
const { findByIdAndUpdate } = require("../models/userModel");
const mongoose = require('mongoose')
const bannerSchema = require("../models/banner");
const orderModel = require("../models/orderModel");
const { query } = require("express");
const reviewModel = require("../models/reviewModel");


dotenv.config({ path: "../config.env" })





let { ObjectId } = mongoose.Types



// =======
let re_fnameError
let re_mobileError
let re_emailError
let re_passwordError
let sweat_alert

// ==============


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash

    } catch (error) {
        console.log(error.message)
    }
}

// mail sent=================verifcation
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.userI,
                pass: process.env.PASS
            }
        })             //Vkbrototype@1234
        const mailOption = {
            from: "vyshak",
            to: email,
            subject: "verify mail"
            , html: '<P> hi ' + name + ' ,please click here to <a href="http://localhost:4000/verify?id=' + user_id + '"> Verify </a>your email</P>'
        }
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error)
            }
            else {
                console.log("email has been sent:-", info.response)
            }

        })

    } catch (error) {
        console.log(error.message)
    }
}

const loadRegister = async (req, res) => {
    try {
        res.render("registration", { re_fnameError, re_mobileError, re_emailError, re_passwordError })
        re_emailError = null
        re_fnameError = null
        re_mobileError = null
        re_passwordError = null

    } catch (error) {
        console.log(error.message);
    }
}
// ---------------------------

const insertUser = async (req, res) => {
    try {

        const name = req.body.name
        const email = req.body.email
        const mobile = req.body.mobile
        const password = req.body.password

        //
        const userdata = await User.findOne({ email: email })
        console.log("this " + userdata + ' userdata')
        const nameregex = /\s/g
        const emailregex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
        const mobileregex = /^[0-9]*$/
        const passwordregex = /^[0-9]*$/
        if (name.length <= 4) {
            re_fnameError = "Enter minimum 4 character"
            res.redirect('/register')
        } else if (nameregex.test(name)) {
            re_fnameError = "Enter only text"
            res.redirect('/register')

        } else if (!emailregex.test(email)) {
            re_emailError = "Email not in format"
            res.redirect('/register')
        }
        // else if(userdata)
        // {
        //     //========================repeat check===
        //    if(email===await userdata.email){
        //     re_emailError="Email already exist"
        //     res.redirect('/register')
        //    }
        //    console.log('repeat register');
        // }
        else if (mobile.length <= 9) {
            re_mobileError = "Number must be 10 character"
            res.redirect('/register')
            console.log('passed mobile');
        } else if (!passwordregex.test(password)) {
            re_passwordError = "Only Number accepted "
            res.redirect('/register')

        } else if (password.length < 3) {
            re_passwordError = "min 8 character "
            res.redirect('/register')

        } else {
            const spassword = await securePassword(req.body.password)
            // console.log(req.body)
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                password: spassword,
                is_admin: 0

            })
            console.log('done');
            const userData = await user.save()
            if (userData) {

                sendVerifyMail(req.body.name, req.body.email, userData._id)

                res.render('registration', { re_fnameError, re_mobileError, re_emailError, re_passwordError, message: "You Are Registerd" })
                re_emailError = null
                re_fnameError = null
                re_mobileError = null
                re_passwordError = null
            }
            else {
                res.render(error.message)
            }

        }


    } catch (error) {
        console.log(error.message + "user controller");
    }
}

const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } })
        // console.log(updateInfo);
        res.render("email-verified")

    } catch (error) {
        console.log(error.message);
    }

}
const verificationLoad = async (req, res) => {
    try {
        res.render("verification", message)

    } catch (error) {
        console.log(error.message);
    }
}


// -----------------------------------------------------


const loginLoad = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message + "user controller");
    }
}
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const acess = await User.findOne({ username: email });
        // console.log(email);
        const password = req.body.password;
        const userData = await User.findOne({ email: email })
        // console.log(userData)
        if (userData) {
            const passMatch = await bcrypt.compare(password, userData.password)
            if (passMatch) {
                if (acess.access == true) {
                    req.session.user_id = userData._id
                    res.redirect('/')
                }
            } else {
                res.render('login', { message: "email and password is incorrect" })
            }

        } else {
            res.render('login', { message: "email and password is incorrect" })

        }


    } catch (error) {
        console.log(error.message)
    }
}

// ===========home page=========
const loadHome = async (req, res) => {
    try {
        const search = req.query.search || '';
        const category = req.query.category || "";
        const pageNumber = parseInt(req.query.page) || 1;
        const pageSize = 8;
        const productsQuery = productModel
            .find({ access: true, $or: [{ name: { $regex: '.*' + search + '.*' } }] })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);
        const products = await productsQuery.exec();
        const totalProductsCount = await productModel.countDocuments({
            access: true,
            $or: [{ name: { $regex: '.*' + search + '.*' } }],
        });
        const totalPages = Math.ceil(totalProductsCount / pageSize);
        const categorys = await categorySchema.find();
        const ban = await bannerSchema.find();
        res.render('home', {
            product: products,
            category: categorys,
            banner: ban,
            currentPage: pageNumber,
            totalPages: totalPages,
            search: search,
            sweat_alert
        });
        sweat_alert = null
        

        
    } catch (error) {
        console.log(error.message);
    }
};

// with pagination


const userLogout = async (req, res) => {
    try {
        req.session.user_id = null
        res.redirect('/')

    } catch (error) {
        console.log(error.message);
    }
}
const example = async (req, res) => {
    try {
        res.render("example")
    }
    catch (error) {
        console.log(error.message);
    }
}
//=======loginotp method  ====================================================////////====================================
const otpLogin = async (req, res) => {
    try {
        message = null;

        res.render("otplogin", { message });
    } catch (error) {
        console.log(error.message);
    }
};

const enterOtp = async (req, res) => {
    try {
        message = null
        res.render("otpenter", { otpCheckMail, message });
    } catch (error) {
        console.log(error);
    }
};
function otpgen() {
    let min = 100000; // Minimum value of OTP
    let max = 999999; // Maximum value of OTP
    let OTP = Math.floor(Math.random() * (max - min + 1)) + min; // Generate random number between min and max (inclusive)
    console.log("OTP generated:"); // Log the generated OTP to the console
    return OTP; // Return the generated OTP
}

let generatedOtp;
let otpCheckMail;
const verifyOtpMail = async (req, res) => {
    otpCheckMail = req.body.username;
    try {
        if (req.body.username.trim().length == 0) {
            res.redirect("/otpPage");
            message = "Please fill the form";
            // console.log("checking the whitespace");
        } else {
            const userData = await User.findOne({ username: otpCheckMail });
            // console.log(userData + " its me ");
            // console.log("otpcheckmail else case worked");

            if (userData) {
                if (otpCheckMail) {
                    if (userData.is_verified == 1) {
                        // console.log(otpCheckMail + " mail is verified");
                        if (userData.access == true) {
                            res.redirect("/otpValidate");
                            const mailtransport = nodemailer.createTransport({
                                host: "smtp.gmail.com",
                                port: 465,
                                secure: true,
                                auth: {
                                    user: process.env.USERI,
                                    pass: process.env.PASS   //"bugrppgzomfcgdgd 
                                },
                            });
                            generatedOtp = otpgen();
                            let details = {
                                from: "vkfastion@gmail.com",
                                to: otpCheckMail,
                                subject: "OTP verification",
                                text:
                                    generatedOtp +
                                    " is your e-fa world verification code. Do not share OTP with anyone ",
                            };
                            mailtransport.sendMail(details, (err) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("success");
                                }
                            });
                        } else {
                            res.redirect("/otpPage");
                            message = "Your account has been blocked";
                            // console.log("Your account has been blocked");
                        }
                    } else {
                        res.redirect("/otpPage");
                        message = "Mail is not verified";
                        // console.log("Mail is not verified");
                    }
                }
            } else {
                res.redirect("/otpPage");
                message = "User not found";
                console.log("User not found");
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

const otpVerify = async (req, res) => {
    try {
        // console.log("Entered to otpVerify");
        if (req.body.otpField.join().trim().length == 0) {
            message = "Please Enter OTP";
            res.redirect("/otpValidate");
        } else {
            const OTP = Number(req.body.otpField.join(''));
            // console.log(OTP, generatedOtp);
            const regex_otp = /^\d{6}$/;



            if (generatedOtp == OTP) {
                // console.log('otp is compairing..' + otpCheckMail);
                const userData = await User.findOne({ username: otpCheckMail });
                // console.log(userData);
                req.session.user_id = userData._id;
                // console.log(req.session.user_id, +'otp matched');
                res.redirect("/");
            } else {
                // console.log('otp is incorrect');
                message = "OTP is incorrect";
                res.redirect("/otpValidate");


            }
        }
    } catch (error) {
        console.log(error.message);
    }
};
// =======shop=======================

const shop = async (req, res) => {
    try {
        const search = req.query.search || '';
        const pageNumber = parseInt(req.query.page) || 1;
        const pageSize = 6;
        const categoryId = req.query.category || "";
        const categoryQuery = categoryId ? { category: categoryId } : {};


        let minPrice = 0;
        let maxPrice = Infinity;
        const sortBy = req.query.sortBy || 'pPrice'; // sort by price
        const sortOrder = req.query.sortOrder || 'asc'; // default ascending order
       

        // if (req.query.price) {

        if (req.query['price-all'] == "on") {
            // If 'All Price' is selected, set the minPrice and maxPrice to their default values
            minPrice = 0;
            maxPrice = Infinity;
        } else {
            // If a specific price range is selected, set the minPrice and maxPrice based on the selected checkboxes
            if (req.query['price-1'] == "on") {
                // console.log("4545")
                minPrice = 0;
                maxPrice = 2000;
            } else if (req.query['price-2'] == "on") {
                minPrice = 2000;
                maxPrice = 3000;
            } else if (req.query['price-3'] == "on") {
                minPrice = 3000;
                maxPrice = 4000;
            } else if (req.query['price-4'] == "on") {
                minPrice = 4000;
                maxPrice = 5000;
            } else if (req.query['price-5'] == "on") {
                minPrice = 19000;
                maxPrice = Infinity;
                console.log("hello")
            }
        }
        // }



        const productsQuery = productModel
            .find({
                access: true, 
                $or: [{ name: { $regex: '.*' + search + '.*' ,$options: 'i'} }, ],
                ...categoryQuery,
                selling: { $gte: minPrice, $lte: maxPrice }

            })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })

        const products = await productsQuery.exec();
        const totalProductsCount = await productModel.countDocuments({
            access: true, 
            $or: [{ name: { $regex: '.*' + search + '.*',$options: 'i' } }],
            ...categoryQuery,
            pPrice: { $gte: minPrice, $lte: maxPrice }
        });
        const totalPages = Math.ceil(totalProductsCount / pageSize);

        const categorys = await categorySchema.find();
        const ban = await bannerSchema.find();

        res.render('shop', {
            product: products,
            category: categorys,
            banner: ban,
            currentPage: pageNumber,
            totalPages: totalPages,
            search: search,
            selectedPrice: req.query.price || 'all',
        });
    } catch (error) {
        res.status(500).send('Server Error');
        console.log(error.message);
    }
};




// ==============product detail=========================
const productDetail = async (req, res) => {
    try {

        const id = req.query.id
        const data = await productModel.findOne({ _id: id })
        
       if(data)
       {
        const productData = await productModel.find({ access: true })
        const categorys = await categorySchema.find({ access: true })
        const rev = await reviewModel.find({ product: id }).limit(5)
       
        res.render('productDetail', { product: data, category: categorys, products: productData, sweat_alert, review: rev })
        sweat_alert = null
       }else{
        res.redirect("/shop");
        console.log("nfnf")
       }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
        
    }
}

const addCart = async (req, res) => {
    try {

      
        let quantity = req.body.quantity
        let idpdt = req.body.id
        let price = req.body.price
        let session = req.session.user_id
        let totalprices = price * quantity
        let sizes = req.body.size


        if (req.session.user_id == undefined) {
            res.redirect('/login')
        } else {
            const repeat = await User.findOne({ _id: session, "cart.products": idpdt })
            // console.log("cart" + repeat)

            if (repeat) {
                res.redirect(req.headers.referer);

                sweat_alert = "cart_repeat"



            } else {

                let cartAdd = await User.findByIdAndUpdate({ _id: session }, { $push: { cart: { products: idpdt, quantity: quantity, price: price, totalprice: totalprices, size: sizes } } })

                // =====
                const datas = await User.findOne({ _id: session, "cart.products": idpdt })
              
                let grandTotal = 0
                let grand = datas.cart.forEach(element => {
                    grandTotal += element.totalprice
                });
                
                await User.updateOne({ _id: session }, { $set: { grandtotal: grandTotal } })


                // // =====

                res.redirect('/cart')

            }

        }

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server Error');

    }
}

const cart = async (req, res) => {
    try {
        const id = req.session.user_id 
        if (id) {
            const data = await productModel.find({ access: true })
            const categorys = await categorySchema.find({ access: true })
            const cartData = await User.findById({ _id: id }).populate('cart.products')



            res.render('cart', { product: data, category: categorys, cart: cartData, sweat_alert })
            sweat_alert = null

        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
}

const removeCart = async (req, res) => {
    const id = req.session.user_id 
    console.log(req.session.user_id)
    const pdtId = req.query.id


    if (id == undefined) {
        res.redirect('/login')
    } else {

        const datas = await User.findByIdAndUpdate({ _id: id }, { $pull: { cart: { products: pdtId } } }, { new: true })
       
        const grandTotal = datas.cart.reduce(
            (total, item) => total + item.totalprice,
            0
        );

        // Update the user's grand total
        datas.grandtotal = grandTotal;
        await datas.save();


        res.redirect("/cart")
        sweat_alert = "remove"
    }
}
// ========increment====

const increament = async (req, res) => {
    try {
        const id = req.session.user_id 
        const pdtId = req.query.id
        const data = await User.findOne({ _id: id, "cart.products": pdtId })

        const product = await productModel.findById({ _id: pdtId })


        const total = data.cart.filter((cartIteam) => {
            return cartIteam.products == pdtId
        })


        if (product.quantity <= total[0].quantity) {
            // sweat_alert = "increament"
            // res.redirect(req.headers.referer);
            res.json({ outOfStock: true })



        }
        else {
            const update = await User.updateOne({ _id: id, "cart.products": pdtId }, { $inc: { "cart.$.quantity": 1 } });

            const data = await User.findOne({ _id: id, "cart.products": pdtId })
            const total = data.cart.filter((cartIteam) => {
                return cartIteam.products == pdtId
            })
            //  console.log(total);
            let subTotal = 0
            const quantity = total[0].quantity

            subTotal = total[0].quantity * total[0].price;
            // console.log(subTotal);



            const updateSubTotal = await User.updateOne({ _id: id, "cart.products": pdtId }, { $set: { "cart.$.totalprice": subTotal } });
            // grand total
            const datas = await User.findOne({ _id: id, "cart.products": pdtId })
            let grandTotal = 0
            let grand = datas.cart.forEach(element => {
                grandTotal += element.totalprice

            });
            await User.updateOne({ _id: id, "cart.products": pdtId }, { $set: { grandtotal: grandTotal } })
            res.json({ subTotal, quantity, pdtId, grandTotal })

        }


    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }

}
const decrement = async (req, res) => {
    try {
        const id = req.session.user_id 
        const pdtId = req.query.id
        const data = await User.findOne({ _id: id, "cart.products": pdtId })
        const product = await productModel.findById({ _id: pdtId })


        const total = data.cart.filter((cartIteam) => {
            return cartIteam.products == pdtId
        })

        if (total[0].quantity > 1) {


            //    decrement======
            const update = await User.updateOne({ _id: id, "cart.products": pdtId }, { $inc: { "cart.$.quantity": -1 } });
            const data = await User.findOne({ _id: id, "cart.products": pdtId })
            // total decrement===
          
            const total = data.cart.filter((cartIteam) => {
                return cartIteam.products == pdtId
            })
            const quantity = total[0].quantity

            const subTotal = total[0].quantity * total[0].price


            const updateSubTotal = await User.updateOne({ _id: id, "cart.products": pdtId }, { $set: { "cart.$.totalprice": subTotal } });


            const datas = await User.findOne({ _id: id, "cart.products": pdtId })
            let grandTotal = 0
            let grand = datas.cart.forEach(element => {
                grandTotal += element.totalprice

            });



            res.json({ subTotal, quantity, pdtId, grandTotal })

        } else {

            res.json({ outOfStock: true })


        }


    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server Error');
    }
}

const wishlist = async (req, res) => {
    try {

        const userId = req.session.user_id

        if (userId) {
            const data = await User.findById({ _id: userId }).populate('wishlist.product')
            sweat_alert = null
            console.clear()
            res.render("wishlist", { wishlist: data })
        } else {
            res.redirect("/login");
        }



    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server Error');
    }
}

const addWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id
        // console.log(userId)

        if (userId) {
            const id = req.query.id
            console.log(req.query.id);
            const repeat = await User.findOne({ _id: userId, "wishlist.product": id })
            // console.log("data" + repeat + "data")

            if (repeat) {

                res.redirect(req.headers.referer);
                sweat_alert = "repeat"

            } else {
                const data = await User.findByIdAndUpdate({ _id: userId }, { $push: { wishlist: { product: ObjectId(id) } } })
                res.redirect(req.headers.referer);

                sweat_alert = "not_repeat"
            }


        } else {
           

            res.redirect("/login");


        }
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server Error');
    }
}
const removeWishlist = async (req, res) => {
    try {
        const id = req.session.user_id 
        console.log(req.session.user_id)
        const pdtId = req.query.id


        if (id == undefined) {
            res.redirect('/login')
        } else {

            const datas = await User.findByIdAndUpdate({ _id: id }, { $pull: { wishlist: { product: pdtId } } }, { new: true })
        }
        res.redirect("/wishListDisplay"); //wishListDisplay

    } catch (error) {
        res.status(500).send('Server Error');

    }
}



const profile = async (req, res) => {
    try {
        const id = req.session.user_id 
        const category = await categorySchema.find()
        const userData = await User.findById({ _id: id })

        res.render("userProfile", { user: userData, category: category })
    } catch (error) {
        res.status(500).send('Server Error');

    }
}
const editProfile = async (req, res) => {
    try {
        const id = req.session.user_id 
        const category = await categorySchema.find()
        const userData = await User.findById({ _id: id })

        res.render("editProfile", { user: userData, category: category, sweat_alert })
        sweat_alert = null
    } catch (error) {
        res.status(500).send('Server Error');

    }
}
const updateProfile = async (req, res) => {
    try {
        // console.log(req.body)
        const id = req.session.user_id 
        const userdata = await User.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, email: req.body.email, mobilr: req.body.phone } })
        sweat_alert = "userUpdate"

        res.redirect(req.headers.referer);

    } catch (error) {
        res.status(500).send('Server Error');
    }
}

const editpassword = async (req, res) => {
    try {
        const id = req.session.user_id 

        const userData = await User.findById({ _id: id })

        res.render("editpassword", { user: userData, sweat_alert })
        sweat_alert = null

        // res.redirect(req.headers.referer);
    } catch (error) {
        console.log(error)
    }
}

const changePass = async (req, res) => {
    try {


        const userData = await User.findOne({ _id: req.session.user_id })

        const matchPassword = await bcrypt.compare(req.body.currentPass, userData.password)

        if (matchPassword) {

            const Hashpass = await securePassword(req.body.newPass);

            await User.updateOne({ _id: req.session.user_id }, { $set: { password: Hashpass } })

            const response = {
                message: "Password changed succesfully",
                success: true
            }

            res.json(response)

        } else {

            const response = {
                success: false,
                message: "Entered wrong password"
            }
            res.json(response)
        }

    } catch (error) {
        console.log(error.message);
    }
}

const address = async (req, res) => {
    try {
        const id = req.session.user_id 
        // console.log("iam working");
        let carts = req.query.id
        // console.log(carts);
        const data = await User.findById({ _id: id })
        res.render("address", { user: data, cart: carts })
    } catch (error) {
        res.status(500).send('Server Error');

        console.log(error.message)
    }
}
const addAddress = async (req, res) => {
    try {
        res.render("addAddress")

    } catch (error) {
        console.log(error.message)
    }
}
const addAddressPost = async (req, res) => {
    try {

        const id = req.session.user_id 

        const { Fname, Lname, email, mobileNo, address, country, city, state, zipCode } = req.body;
        const data = await User.findByIdAndUpdate({ _id: id }, { $push: { address: { firtName: Fname, lastName: Lname, E_mail: email, MobileNo: mobileNo, Address_Line: address, country: country, city: city, state: state, zipCode: zipCode } } })

        res.redirect("/address")

    } catch (error) {
        res.status(500).send('Server Error');

    }
}
const removeAddress = async (req, res) => {
    try {
        const addId = req.query.id

        const id = req.session.user_id 
        const delet = await User.updateOne({ _id: id }, { $pull: { address: { _id: addId } } })

        res.redirect(req.headers.referer);

    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error');

    }
}
const editAddress =async(req,res)=>{
    try {
        const id = req.session.user_id 
        // const data = await User.findByIdAndUpdate({ _id: id }, { $push: { address: { firtName: fname, lastName: lname, E_mail: email, MobileNo: Mobile, Address_Line: address, country: country, city: city, state: state, zipCode: zipCode } } })

        const userData = await User.findById({ _id: id }) //.populate("cart.products")

        const address = userData.address.id(req.query.val);
        // console.log(address)
        res.render("editAddress",{address})
    } catch (error) {
        console.log(error)
    }

}
const updateAddress = async (req,res)=>{
    try {
        const id = req.session.user_id 
        
        const {Fname,Lname,email,mobileNo,address,country,city,state,zipCode,select}=req.body
        console.log(Fname+""+Lname)

        const updatedAddress = {
            firtName: Fname,
            lastName: Lname,
            E_mail: email,
            MobileNo: mobileNo,
            Address_Line: address,
            country: country,
            city: city,
            state: state,
            zipCode: zipCode
        };
        const result = await User.updateOne(
            { _id: id, "address._id": select },
            { $set: { "address.$": updatedAddress } }
        );


        res.redirect("/address");

    } catch (error) {
        console.log(error)
    }
}

const review = async (req, res) => {
    try {
        const date = new Date();
       
        const data = new reviewModel({
            review: req.body.review,
            name: req.body.name,
            email: req.body.email,
            product: req.body.product,
            datee: date
        })
        await data.save()
        sweat_alert = "review"

        res.redirect(req.headers.referer);


    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    loadRegister,
    insertUser,
    verificationLoad,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome
    , userLogout
    , example, otpLogin,
    enterOtp,
    verifyOtpMail,
    otpVerify, shop
    , productDetail, cart
    , addCart, removeCart,
    increament, decrement,
    wishlist, addWishlist, removeWishlist,
    // =====profile====

    profile, editProfile, updateProfile, editpassword, changePass,
    address, addAddress, addAddressPost, removeAddress,editAddress,updateAddress,
    review

}
// checkout, proceedToCheckout, sucess,myOrderscate