const isLogin=async(req,res,next)=>{
    try {
        if(req.session.user_id){
            next()
        }
        else{
            res.redirect('/')
            sweat_alert="signIn"
        }
    
    } catch (error) {
        console.log(error)
    }
}
const isLogOut=async(req,res,next)=>{
    try {
        if(req.session.user_id)
        {
            res.redirect('/')
        }
        else{
            next()
        }
    } catch (error) {
        console.log(error)
    }
}
module.exports={
    isLogin,
    isLogOut
}