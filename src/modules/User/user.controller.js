import { Router } from "express";
import { auth } from "../../middlewares/auth.midddleware.js";
import { validation } from "../../middlewares/validation.middlewate.js";
import { uploadFile } from "../../utils/multer.js";
import { successRes } from "../../utils/success.res.js";
import { resetPasswordSchema } from "../User/user.validation.js";
import { logout,confirmEmail, forgetPassSendOtp, googlelogin, loginService, logoutFromAllDevices, refreshToken, resentConfirmEmailOtp, resetPassword, signupService } from "./user.service.js";
import { signupScema } from "./user.validation.js";
const router = Router();

export const routes ={
    base : "/users",
    signup : "/signup", //POST
    login : "/login",
    me : "/me", // GET
    refreshToken  : "/refresh-token", //POST
    googleSignUp : "/signup/gmail",
    confirmEmail : "/confirm-email",  // PATCH
    forgetPass : "/forget-password", //PATCH
    resetPassword : "/reset-password", // PATCH
    uploadFile  :"/upload-file", // GET
    resentConfirmEmailOtp : "resend-confirm-otp", //POST
    logoutFromAllDevices : "/logout-from-all-devices", //POST
    logoutFromoneDevice : "/logout-from-one-device", //POST

}


router.post(routes.signup,validation(signupScema), async (req,res)=>{

   
    const {data} = await signupService(req.body)

    return successRes({
        res,
        status  : 201,
        data
    })
})

router.post(routes.login,async(req,res)=>{

    const {identifier,password}= req.body
    const {data} = await loginService(identifier,password)
    return successRes({res,data})
})


router.get(routes.me,auth,async (req,res)=>{
    const user = req.user 
    successRes({res,data :{user}})
})

router.post(routes.refreshToken,async(req,res)=>{
    const authorization = req.headers.authorization
   const {data}  = await refreshToken(authorization)
    return successRes({
        res,
        data
    })
})


router.post(routes.googleSignUp,async(req,res)=>{

    const {data} = await googlelogin(req.body.idToken)
    //await googlelogin(req.body.idToken)
    successRes({res,data})
    
})

router.patch(routes.confirmEmail,async(req,res)=>{
    const{email,otp}= req.body
    const {data} = await confirmEmail(email,otp)

    successRes({
        res,
        data
    })

})

router.patch(routes.forgetPass,async(req,res)=>{
    const {email} = req.body

    await forgetPassSendOtp(email)

    return successRes({
        res
        
    })
})

router.patch(routes.resetPassword,validation(resetPasswordSchema),async(req,res)=>{
    const {email,otp ,password } = req.body

    await resetPassword(email,otp , password)
    successRes({res})

})

router.get(routes.uploadFile,auth,uploadFile("general").single("image"),(req,res)=>{
    console.log({
        body : req.body,
        files  :req.file
    });
    
    successRes({res})
})

router.post(routes.resentConfirmEmailOtp,async(req,res)=>{
    const {email}= req.body
    const {data} = await resentConfirmEmailOtp(email)

    successRes({res,data})
})

router.post(routes.logoutFromoneDevice,auth,async(req,res)=>{
    const userId = req.user._id
    const jti = req.jti 
    await logout(userId,jti)
    return successRes({
        res
    })
})

router.post(routes.logoutFromAllDevices,auth,async(req,res)=>{
    const userId = req.user._id
    await logoutFromAllDevices(userId)
    return successRes({
        res
    })
})

export default router