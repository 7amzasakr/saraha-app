import { Router } from "express";
import {successRes}from "../../utils/success.res.js"
import { loginService, signupService ,refreshToken, googlelogin,confirmEmail, forgetPassSendOtp, resetPassword} from "./user.service.js";
import { auth, authorization, decodeToken } from "../../middlewares/auth.midddleware.js";
import { uploadFile } from "../../utils/multer.js";
import { signupScema } from "./user.validation.js";
import { errorRes } from "../../utils/error.handel.js";
import { validation } from "../../middlewares/validation.middlewate.js";
import {resetPasswordSchema} from "../User/user.validation.js"
import multer from "multer";
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


// router.patch("/chexk-email",async(req,res)=>{
//     const {email,otp} = req.body
// })

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





export default router