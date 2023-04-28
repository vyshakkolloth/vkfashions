const bcrypt = require('bcrypt')
const fs = require('fs')
const sharp = require('sharp')


const bannerSchema = require('../models/banner')
const orderModel = require('../models/orderModel')
const productModels = require('../models/productModel')
const User = require('../models/userModel')
const pdtCategory = require('../models/category')

const { query } = require('express')
const productModel = require('../models/productModel')




let message = null
let sweatAlert
const images = []

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash

    } catch (error) {
        console.log(error.message)
    }
}





const loadlogin = async (req, res) => {
    try {
        res.render('adminLogin')


    } catch (error) {
        console.log(error.message);
    }
}
const verify = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password


        const userdata = await User.findOne({ email: email })


        if (userdata) {
            const passwordMatch = await bcrypt.compare(password, userdata.password)

            if (passwordMatch) {
                if (userdata.is_admin === 0) {
                    res.render('adminLogin', { message: "incorrect email and password admin1" })
                } else {

                    req.session.admin_id = userdata._id
                    res.redirect("/admin/home")
                    console.log("password matched")


                }

            } else {
                res.render('adminLogin', { message: "incorrect email and password admin" })
            }
        } else {
            res.render('adminLogin', { message: "incorrect email and password admin 0" })
        }

    } catch (error) {
        console.log(error.message);

    }
}
const loadhome = async (req, res) => {
    try {
        const user = await User.find().count()
        const product = await productModel.find().count()
        const order = await orderModel.find().count()
        const revenue = await orderModel.aggregate([
            {
                $match: {
                    status: "Active",
                    orderStatus: "Delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$grandTotal" }
                }
            }
        ])


        const cod = await orderModel.find({ paymentMethod: "cod" }).count()
        const razo = await orderModel.find({ paymentMethod: "razorpay" }).count()
        const wallet = await orderModel.find({ paymentMethod: "wallet" }).count()
        const active = await orderModel.find({ status: "Active" }).count()
        const cancel = await orderModel.find({ status: "Cancel" }).count()
        // ======================================================================
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

        const monthlyStart = new Date(currentYear, currentMonth, 1).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const monthlyEnd = new Date(currentYear, currentMonth, daysInMonth);

        const monthlySalesData = await orderModel.find({
            'arrivingDate': {
                $gte: monthlyStart,
                $lte: monthlyEnd,
            },
        }).populate('order.product')
        // console.log(monthlySalesData+"4545454")
        
        // ==0
        const dailySalesDetails = []
        for (let i = 2; i <= daysInMonth + 1; i++) {
            const date = new Date(currentYear, currentMonth, i)
            const salesOfDay = monthlySalesData.filter((order) => {
                return new Date(order.arrivingDate).toDateString() === date.toDateString()
            })
            const totalSalesOfDay = salesOfDay.reduce((total, order) => {
                return total + order.grandTotal;
            }, 0);
            let productCountOfDay = 0;
            salesOfDay.forEach((order) => {
                productCountOfDay += order.order[0].product.quantity;
            });

            dailySalesDetails.push({ date: date, totalSales: totalSalesOfDay, totalItemsSold: productCountOfDay });
        }

        // ======================================================================
        

        
        res.render('dashboard', { user, product, order, revenue, cod, razo, wallet, active, cancel ,dailySalesDetails})
    } catch (error) {
        console.log(error.message)
    }
}
const userTable = async (req, res) => {
    try {
        var search = ""
        if (req.query.search) {
            search = req.query.search
            console.log(search)
        }


        const userData = await User.find({ is_admin: 0, $or: [{ name: { $regex: ".*" + search + ".*", $options: "i" } }] })

        res.render('usertable', { user: userData })
    } catch (error) {
        console.log(error.message);
    }
}
const adminlogout = async (req, res) => {
    try {
        req.session.admin_id = null
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}
// const addUser = async (req, res) => {
//     try {
//         res.render('new-user')

//     } catch (error) {
//         console.log(error.message);
//     }
// }
// const addNewUser = async (req, res) => {
//     try {
//         const spassword = await securePassword(req.body.password)
//         console.log(req.body)
//         const user = new User({
//             name: req.body.name,
//             email: req.body.email,
//             mobile: req.body.mobile,
//             password: spassword,
//             is_admin: 0
//         })
//         const userData = await user.save()
//         if (userData) {
//             res.render('new-user', { message: "sucess" })
//         }
//         else {
//             res.render(error.message + "user controller")
//         }


//     } catch (error) {
//         console.log(error.message + "user controller");
//     }
// }
//edit option
// const editUser = async (req, res) => {
//     try {
//         const id = req.query.id
//         const userdata = await User.findById({ _id: id })
//         if (userdata) {
//             res.render('edit-user', { user: userdata })

//         } else {
//             res.redirect('/admin/home')
//         }

//     } catch (error) {
//         console.log(error.message);
//     }

// }
// const updateUser = async (req, res) => {
//     try {
//         const userdata = await User.findByIdAndUpdate({ _id: req.body.id }, { $set: { name: req.body.name, email: req.body.email, mobilr: req.body.mobile } })
//         res.redirect("/admin/userTable")
//     } catch (error) {
//         console.log(error.message)
//     }
// }
// const deleteUser = async (req, res) => {
//     try {
//         id = req.query.id
//         const dele = await User.deleteOne({ _id: id })
//         res.redirect("/admin/userTable")
//     } catch (error) {
//         console.log(error.message + "hi");
//     }
// }
const loadCategory = async (req, res) => {
    try {
        const categorys = await pdtCategory.find()
        res.render("addCategory", { sweatAlert, category: categorys })
        sweatAlert = null
    } catch (error) {
        console.log(error.message)
    }
}
const addCategory = async (req, res) => {
    try {
        const verifyName = await pdtCategory.findOne({ name: req.body.name })
        if (verifyName) {
            sweatAlert = "exits"
            res.redirect('/admin/category')
        }
        else {
            const category = new pdtCategory({ name: req.body.name })
            sweatAlert = "added"

            const PdtCategory = await category.save()
            if (PdtCategory) {
                res.redirect('/admin/category')
            }

        }


    } catch (error) {
        console.log(error.message)
    }
}
const deleteCategory = async (req, res) => {
    try {
        // let id = req.body.category
        let id = req.query.id


        // console.log(id);
        const condition = await pdtCategory.findOne({ _id: id })
        if (condition.access) {

            const update = await pdtCategory.updateOne({ _id: id }, { $set: { access: false } })
            
            if (update) {
                sweatAlert = "Blocked"
                res.redirect("/admin/category")

            }

        } else {

            const update = await pdtCategory.updateOne({ _id: id }, { $set: { access: true } })
           
            if (update) {
                sweatAlert = "notblocked"
                res.redirect("/admin/category")

            }

        }

    } catch (error) {
        console.log(error.message);
    }
}

const acess = async (req, res) => {
    try {
        const id = req.query.id
        const userdata = await User.findById({ _id: id })
        if (userdata.access) {
            await User.updateOne({ _id: id }, { $set: { access: false } })
            res.redirect('/admin/userTable')
        }
        else {
            await User.updateOne({ _id: id }, { $set: { access: true } })
            res.redirect('/admin/userTable')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const addProduct = async (req, res) => {
    try {
        const category = await pdtCategory.find()

        res.render('addProduct', { listCategory: category, message })
        message = null
    } catch (error) {
        console.log(error.message);
    }
}
// add product
const addProductPost = async (req, res) => {
    try {
        const verifyName = await productModels.findOne({ name: req.body.name })
        if (verifyName) {
            message = "product ALready Exits"
            res.redirect('/admin/addProduct')
        } else {
            if (req.body.name === "" || req.body.pPrice === "" || req.body.brand === "" || req.body.sPrice === "" || req.body.discription === "" || req.body.Category === "" || req.body.quantity === "" || req.body.quantity < 0) {
                message = "Please Fill all the Feilds also number shoud be greater than zero"
                res.redirect('/admin/addProduct')
            } else {
                // for (let i = 0; i < req.files.length; i++) {
                //     images[i] = req.files[i].filename

                // }
                let image = req.files.map(file => file);
                for (i = 0; i < image.length; i++) {
                    let path = image[i].path
                    const processImage = new Promise((resolve, reject) => {
                        sharp(path).rotate().resize(500, 500).toFile('public/images/' + image[i].filename, (err) => {
                            sharp.cache(false);
                            if (err) {
                                console.log(err);
                                reject(err);
                            } else {
                                resolve();
                            }
                        })
                    });
                    processImage.then(() => {
                        fs.unlink(path, (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                            }
                        });
                    }).catch((err) => {
                        console.log(err);
                    });
                }
                // 
                const Category = await pdtCategory.findOne({ name: req.body.category })
                const product = new productModels({
                    name: req.body.name,
                    pPrice: req.body.pPrice,
                    brand: req.body.brand,
                    selling: req.body.sPrice,
                    description: req.body.discription,
                    category: Category,
                    quantity: req.body.quantity,
                    image: req.files.map(file => file.filename),
                    size: req.body.size

                })
                const productData = await product.save()
                if (productData) {
                    message = "Product Added SuccesFully *"
                    res.redirect('/admin/addProduct')
                }

            }

        }






        res.redirect('/admin/addProduct')
    } catch (error) {
        console.log(error.message)
    }
}

const productList = async (req, res) => {
    try {
        const productData = await productModels.find().populate("category")
        console.log(productData.category);
        res.render("productList", { product: productData })

    } catch (error) {
        console.log(error.message);
    }
}
const productDelete = async (req, res) => {
    try {
        let id = req.query.id
        const conditon = await productModels.findById({ _id: id })
        if (conditon.access) {

            const acess = await productModels.updateOne({ _id: id }, { $set: { access: false } })
            res.redirect("/admin/productList")
        } else {
            const acess = await productModels.updateOne({ _id: id }, { $set: { access: true } })
            res.redirect("/admin/productList")

        }

    } catch (error) {
        console.log(error.message);
    }
}
//edit product===============

const editProduct = async (req, res) => {
    try {
        const id = req.query.id
        let productData = await productModels.findById({ _id: id })
        res.render("edit_product", { product: productData, message })
        image = null

        message = null
    } catch (error) {
        console.log(error.message);
    }
}
//====================== post method edit product==================================
const updateProduct = async (req, res) => {
    try {
        // console.log(req.body)
        const { id, name, pPrice, brand, quantity, sPrice, discription } = req.body




        let productData = await productModels.findById({ _id: id })






        if (req.files) {
            // ===
            let image = req.files.map(file => file);
            for (i = 0; i < image.length; i++) {
                let path = image[i].path
                const processImage = new Promise((resolve, reject) => {
                    sharp(path).rotate().resize(500, 500).toFile('public/images/' + image[i].filename, (err) => {
                        sharp.cache(false);
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
                });
                processImage.then(() => {
                    fs.unlink(path, (err) => {
                        if (err) {
                            console.log(err);
                        } else {
                        }
                    });
                }).catch((err) => {
                    console.log(err);
                });
            }
            // ====
            console.log()
            productData.image =req.files.map(file => file.filename).concat(productData.image)
            await productData.save()

           
        
    }



        const productUpdate = await productModels.findByIdAndUpdate({ _id: id }, { $set: { name: name, quantity: quantity, selling: sPrice, brand: brand, pPrice: pPrice, description: discription } })
    if (productUpdate) {
        res.redirect('/admin/productList')
    }

} catch (error) {
    console.log(error.message);

}
}

// =====delete photo== in product update
const deletePhoto = async (req, res) => {
    try {
        console.log(req.query)

        const imageId = req.query.delete;
        const productId = req.query.product;
        //==fs 
        const path = ''//'public/images/'+imageId; // Replace with the path to your uploaded file

        fs.unlink(path, (err) => {
            if (err) {
                console.error(err);
                return;
            }

            // console.log(`File ${path} has been deleted`);
        });

        // ==fs


        await productModels.findByIdAndUpdate(
            productId, // Image ID to update
            { $pull: { image: { $in: [imageId] } } }, // Remove image ID from products array
            { new: true } // Return the updated document
        )
            .then((updatedImage) => {
                console.log(`Successfully deleted image reference with ID ${imageId}`);
                console.log(updatedImage);
            })
            .catch((error) => {
                console.log(`Error deleting image reference with ID ${imageId}`);
                console.error(error);
            });
        res.redirect(req.headers.referer);
    } catch (error) {
        console.log(error)
    }
}
// ====banner managment====

const bannerManagment = async (req, res) => {
    try {
        const data = await bannerSchema.find()
        res.render("bannerManagment", { sweatAlert, data })
        sweatAlert = null
    } catch (error) {
        console.log(error, message);
    }
}
// const uploadBannerManagment = async (req, res) => {
//     try {
//         console.log(req.body.text1)

//         let data = new bannerSchema({ 
//             image: req.file.filename,
//             title1:req.body.text1,
//             title2:req.body.text2
//         })

//         let upload = await data.save()
//         sweatAlert = "bannerSucces"
//         if (upload) {
//             res.redirect(req.headers.referer);
//         }


//     } catch (error) {
//         console.log(error.message)
//     }
// }
const uploadBannerManagment = async (req, res) => {
    try {

        // ===========

        let data = new bannerSchema({
            image: req.file.filename,
            title1: req.body.text1,
            title2: req.body.text2
        })

        let upload = await data.save()
        sweatAlert = "bannerSucces"
        if (upload) {
            res.redirect(req.headers.referer);
        }


    } catch (error) {
        console.log(error.message)
    }
}
const deleteBanner = async (req, res) => {
    try {
        let id = req.query.id
        console.log(id)
        let delet = await bannerSchema.findByIdAndRemove({ _id: id })
        res.redirect(req.headers.referer);
    } catch (error) {
        console.log(error.message)
    }
}

// *************end of banner mangement





const orderManagment = async (req, res) => {
    try {
        let data = await orderModel.find().populate("user").populate("order.product")

        // console.log(data[0].order)

        res.render("orderManagment", { data, sweatAlert })
        sweatAlert = null

    } catch (error) {
        console.log(error, message);
    }
}

const approval = async (req, res) => {
    try {
        // console.log(req.query)
        const id = req.query.id
        const order = await orderModel.findOne({ _id: id })
        // console.log(order.orderStatus + "incoming")



        if (order.orderStatus == "Pending") {

            await orderModel.findOneAndUpdate({ _id: id }, { $set: { "orderStatus": "Shipped" } })
            const result = await orderModel.findOne({ _id: id })
            console.log(result.orderStatus + " outgoing")
            res.json(result)
        } else {
            if (order.orderStatus == "Shipped") {
                await orderModel.findOneAndUpdate({ _id: id }, { $set: { "orderStatus": "Delivered" } })
                // console.log(result + "5556666")
                const result = await orderModel.findOne({ _id: id })
                console.log(result.orderStatus + "outgoing")
                res.json(result)
            } else {
                if (order.orderStatus == "Delivered") {
                    //  await orderModel.findOneAndUpdate({ _id: id }, { $set: { "orderStatus": "Pending" } })
                    //  const result = await orderModel.findOne({ _id: id })
                    // console.log(result.orderStatus+"outgoing")
                    // console.log(result + "45454")

                    res.json({ outOfStock: true })
                }

            }
        }
        // res.json(result)


    }



    catch (error) {

    }
}

const salesReport = async (req, res) => {
    try {


        // console.log(req.query)
        const { startDate, endDate } = req.query;

        const pipeline = [
            { $match: { orderStatus: "Delivered", status: "Active" } },
            { $unwind: "$order" },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "order.product",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $project: {
                    _id: 0,
                    userName: { $arrayElemAt: ["$userDetails.name", 0] },
                    productName: { $arrayElemAt: ["$productDetails.name", 0] },
                    quantity: "$order.quantity",
                    deliveryDate: "$arrivingDate",
                    totalPrice: "$order.totalprice",
                },
            },
        ];

        if (startDate && endDate) {
            // console.log("iam who iam")
            const fromDate = new Date(startDate);
            const toDate = new Date(endDate);

            pipeline.push({
                $match: {
                    deliveryDate: {
                        $gte: fromDate,
                        $lte: toDate,
                    },
                },
            });
        }

        pipeline.push({
            $sort: {
                deliveryDate: 1,
            },
        });

        const deliveredProducts = await orderModel.aggregate(pipeline);


        // console.log(deliveredProducts)
        res.render("salesReport", { deliveredProducts })

    } catch (error) {

        console.log(error);
        res.status(500).send("Server Error");
    }
}






module.exports = {
    loadlogin,
    verify,
    loadhome,
    adminlogout,
   
    
    loadCategory, addCategory, deleteCategory,
    userTable, acess
    , addProduct, addProductPost, deletePhoto, productList, productDelete
    , editProduct, updateProduct, orderManagment,
    bannerManagment, uploadBannerManagment, deleteBanner
    , approval, salesReport
}
//deleteUser, editUser, updateUser, addUser, addNewUser,