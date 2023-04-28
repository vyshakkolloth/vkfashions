const isLogin=async(req,res,next)=>{
try {
    if(req.session.admin_id){ 
        next();
        }
    else{
        // next();
        res.redirect('/admin')
        
    }
   
} catch (error) {
    console.log(error.message+"iam");
}
}
const isLogOut=async(req,res,next)=>{
    try {
        if(req.session.admin_id)
        {
            res.redirect('/admin/home')
                
        }else{
            next() 
        }
       

    } catch (error) {
        console.log(error.message+"here im");
    }
}
module.exports={
    isLogin,
    isLogOut
}