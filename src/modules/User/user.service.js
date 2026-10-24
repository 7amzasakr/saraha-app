import { userModel } from "../../DB/models/user.model.js"
import { errorRes } from "../../utils/error.handel.js"
import jwt from "jsonwebtoken"
import { decodeToken } from "../../middlewares/auth.midddleware.js"
import { tokenEnum } from "../../middlewares/auth.midddleware.js"
import { createHash } from "../../utils/security/hach.js"
import { compareHash } from "../../utils/security/hach.js"
import {OAuth2Client} from "google-auth-library"
import { ProviderEnum } from "./user.types.js"
import { successRes } from "../../utils/success.res.js"
import { emailTemplate } from "../../utils/security/email/emailTemplate.js"
import { random } from "../../utils/security/email/createOtp.js"
import { sendEmail } from "../../utils/security/email/sendEmail.js"
import { email } from "zod"

const googleClient = new OAuth2Client()


export const signupService = async ({fullname , email , gender,password , phone , bio ,age , userName })=>{

        const isExist = await userModel.findOne({
            $or : [
                {email},
                {userName}
            ]
        })


    if(isExist){
        errorRes({
            msg : `${isExist.email == email?"eamil" : "username"} already exist`,
            statusCode : 400
        })
    }

    const otp = random(6)
    await sendEmail({
        to: email,
        subject:"confirm email",
        html : emailTemplate({otp,subject:"confirm email"})
    })

    const user = await userModel.create({
        fullname,
        email,
        password : await createHash(password),gender,phone,bio, age , userName,
        otp: {
            code: await createHash(otp),
            expireIn: Date.now() + 5 * 60 * 1000
        }
    })

    return {
        data : {
            user
        }
    }
}   


export const loginService = async (identifier,password)=>{
    const user =await userModel.findOne({
        $or : [
            {email  : identifier},
            {userName : identifier},
        ]
    })
    if(!user){
        errorRes({
            msg : "invalid credentials",
            statusCode : 400
        })
    }

    
    const isPasswordMatch = await compareHash(password,user.password)

    if(!isPasswordMatch){
         errorRes({
            msg : "invalid credentials",
            statusCode : 400
        })
    }

    const accessToken =jwt.sign({
        _id : user._id,
        email :  user.email
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn : "15m"
    })

    const refreshToken = jwt.sign({
        _id : user._id,
        email : user.email
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn :"7d"
    })

    return {
        data  :{
            accessToken,
            refreshToken
        }
    }

    

}


export const refreshToken = async (authorization)=>{
     const {user} = await decodeToken({authorization,tokenType:tokenEnum.refresh})    
    const accessToken = jwt.sign({
        _id:user._id,
        email : user.email
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"30M"
    })
    return {
        data:{
            accessToken
        }
    }
}

export const googlelogin = async(token)=>{

    const ticket = await googleClient.verifyIdToken({
        idToken : token,
        audience  : process.env.CLIENT_ID
    })
   


    const {email,name, picture} = ticket.getPayload()

    let user = await userModel.findOne({email})

    if(user){
        if(user.provider != ProviderEnum.google){
            errorRes({
                msg :`use your provider`
            })
        }
        
        
        
    }else{
        user = await userModel.create({
            email,
            fullname : name,
            profileImage : picture,
            provider : ProviderEnum.google
        })
    }









    const accessToken =jwt.sign({
            _id : user._id,
            email :  user.email
        },process.env.ACCESS_TOKEN_SECRET,{
            expiresIn : "15m"
        })

        const refreshToken = jwt.sign({
            _id : user._id,
            email : user.email
        },process.env.REFRESH_TOKEN_SECRET,{
            expiresIn :"7d"
        })


        return {
            data : {
                accessToken,
                refreshToken
            }
        }
}


export const confirmEmail = async(email,otp)=>{
    const user = await userModel.findOne({
        email, confirmedAt : {
            $exists : false
        }
    })
    if(!user){
        errorRes({
            msg:"user not found",
            statusCode : 404
        })
    }
    
    await checkOtp(user,otp)

    user.confirmedAt = Date.now()
    await user.save()
    return {
        data : {
            
        }
    }
}

export const forgetPassSendOtp = async (email)=>{
    const user = await userModel.findOne({email})
    if(!user){
        return ;
    }

    if(user.otp.expireIn>Date.now()){
        return ;
    }

    const otp = random(6)
    user.otp.code = await createHash(otp)
    user.otp.expireIn = Date.now() + 5*60*1000;
    await user.save()

    sendEmail({
        to :email,
        subject : "forget password",
        html : emailTemplate({
            otp,
            subject : "forget password"
        })
    })

    return {
        data : {}
    }

}

export const resetPassword = async (email,otp,password)=>{
    const user = await userModel.findOne({email})

    if(!user){
        errorRes({
            msg:"user not found",
            statusCode : 404
        })
    }

    await checkOtp(user,otp)

    user.password = await createHash(password)

    await user.save();

    return {
        data : {}
    }

}




export const checkOtp = async (user,otp)=>{
    if(!user.otp || user.otp.expireIn<Date.now()){
        errorRes({
            msg : "otp expired",
            statusCode : 404
        })
    }
    if(await compareHash(otp , user.otp.code)){
        errorRes({
            msg : "invalid otp",
            statusCode : 400
        })
    }
}