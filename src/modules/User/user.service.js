import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import { userModel } from "../../DB/models/user.model.js"
import { redisClient } from "../../DB/redis.connect.js"
import { decodeToken, tokenEnum } from "../../middlewares/auth.midddleware.js"
import { errorRes } from "../../utils/error.handel.js"
import { attemptsBlockCountKey, attemptsBlockKey, attemptsKey, confrimEmailKey, resendOtpKey, userPrefixKey,userSessionJwtIdKey, userSessionJwtIdPrefixKey } from "../../utils/redis-servces.js"
import { random } from "../../utils/security/email/createOtp.js"
import { emailTemplate } from "../../utils/security/email/emailTemplate.js"
import { sendEmail } from "../../utils/security/email/sendEmail.js"
import { compareHash, createHash } from "../../utils/security/hach.js"
import { ProviderEnum } from "./user.types.js"
import { nanoid } from "nanoid"
const googleClient = new OAuth2Client()

const calcBlockSecs = (count)=>{
    const Block_Mins_Arr = [5, 15, 60, 300, 1440 ]
    const index = Math.min(CountQueuingStrategy, Block_Mins_Arr.length)
    return Block_Mins_Arr[index - 1] *60
}


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
    sendEmail({
        to: email,
        subject:"confirm email",
        html : emailTemplate({otp,subject:"confirm email"})
    })

    const user = await userModel.create({
        fullname,
        email,
        password : await createHash(password),
        gender,
        phone,
        bio,
        age,
        userName,        
    })

    const redisKey = confrimEmailKey(user._id)
    await redisClient.set(redisKey,await createHash(otp),{
        expiration : {
            type : "EX",
            value : 5 * 60
        }
    })

    await redisClient.set(resendOtpKey(user._id),0,{
        expiration : {
            type :"EX",
            value : 60
        }
    })

    await redisClient.incr(attemptsKey(user._id))

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

    const jwtid = nanoid()

    const accessToken =jwt.sign({
        _id : user._id,
        email :  user.email
        
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn : "30m",
        jwtid 
    })

    const refreshToken = jwt.sign({
        _id : user._id,
        email : user.email
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn :"7d",
        jwtid
    })
    await redisClient.set(userSessionJwtIdKey(user._id,jwtid),jwtid,{
        expiration: {
            type : "EX",
            value : 7*24*60*60
        }
    })
    return {
        data  :{
            accessToken,
            refreshToken
        }
    }

    
}


export const refreshToken = async (authorization)=>{
     const {user, jti} = await decodeToken({authorization,tokenType:tokenEnum.refresh})    
    const accessToken = jwt.sign({
        _id:user._id,
        email : user.email
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"30M",
        jwtid : jti
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

export const resentConfirmEmailOtp = async (email)=>{
    const user = await userModel.findOne({email,
        confirmedAt : {
            $exists : false
        }
    });
    if(!user){
        errorRes({
            msg : "user not found",
            statusCode : 404
        })
    }
    const userId = user._id
    const cannotResend = (await redisClient.get(resendOtpKey(userId))|| await redisClient.get(attemptsBlockCountKey(userId)))
    if(cannotResend){
        errorRes({
            msg  :"wait",
            statusCode : 400
        })
    } 
    const attempts = await redisClient.incr(attemptsKey(user._id))
    if(attempts >=5 ){
        const blockCount = await redisClient.incr(attemptsBlockCountKey(user._id))
        await redisClient.set(attemptsBlockCountKey(user._id),0,{
            expiration : {
                type : "EX",
                value : calcBlockSecs(blockCount)
            }
        })
        await redisClient.set(attemptsKey(user._id),0);

    }else {
        await redisClient.set(resendOtpKey(user._id),0,{
            expiration : {
                type : "EX",
                value : 60
            }
        })
    }
    const otp =random(6)
    sendEmail({
        to : email,
        subject : "confirm email",
        html : emailTemplate({otp,subject:"confirm email"})
    })

    const redisKey = confrimEmailKey(user._id)

    await redisClient.set(redisKey,await createHash(otp),{
        expiration : {
            type  :"EX",
            value : 60 * 5
        }
    })
    return {
        data : {

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
    
    const hashedOtp = await redisClient.get(confrimEmailKey(user._id))
    if(!otp || !hashedOtp){
        errorRes({
            msg : "invalid ot expired otp",
            statusCode : 400
        })
    }

    const isBlocked = await redisClient.get(attemptsBlockKey(user._id))

    if(isBlocked){
        const blockedTTL = await redisClient.ttl(attemptsBlockKey(user._id))
        errorRes({
            msg : `try again after ${Math.round(blockedTTL/60)} M`,
            statusCode : 400
        })
    }

    const isOtpCorrect = await compareHash(otp,hashedOtp)

    if(!isOtpCorrect){
        const attemps = await redisClient.incr(attemptsKey(user._id))
        if(attemps>=5){
            const blockCount = await redisClient.incr(attemptsBlockCountKey(user._id))

            await redisClient.set(attemptsBlockKey(user._id),0,{
                expiration : {
                    type : "EX",
                    value : calcBlockSecs(blockCount)
                }
            })
            await redisClient.set(attemptsKey(user._id),0)
            errorRes({
                msg  :`try again after ${Math.round(blockCount/60)}M`,
                statusCode : 400
            })

        }
    }else{
        user.confirmedAt = Date.now()
        await user.save()
        const userKeys = await redisClient.keys(`${userPrefixKey(user._id)}*`)
        await redisClient.del(userKeys)
    }

    
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

    const hashedotp = await redisClient.get(confrimEmailKey(user._id))

    user.password = await createHash(password)

    await user.save();

    return {
        data : {}
    }

}




// export const checkOtp = async (user,otp)=>{
//     if(!user.otp || user.otp.expireIn<Date.now()){
//         errorRes({
//             msg : "otp expired",
//             statusCode : 404
//         })
//     }
//     if(await compareHash(otp , user.otp.code)){
//         errorRes({
//             msg : "invalid otp",
//             statusCode : 400
//         })
//     }
// }

export const logout = async (userId,jti)=>{
    const user = await userModel.findById(userId)
    if(!user){
        errorRes({
            msg : "user not found",
            statusCode : 404
        })
    }
    const deleteCount = await redisClient.del(userSessionJwtIdKey(userId,jti))
        if(deleteCount<1){
            errorRes({
                msg : "alredy logged out"
            })
        }
    return {
        data : {

        }
    }
}

export const logoutFromAllDevices = async (userId)=>{
    const user = await userModel.findById(userId)
    if(!user){
        errorRes({
            msg : "user not found",
            statusCode : 404
        })
    }
    const sessionKey = await redisClient.keys(`${userSessionJwtIdPrefixKey(userId)}:*`)
    const deleteCount = await redisClient.del(sessionKey)
        if(deleteCount<1){
            errorRes({
                msg : "alredy logged out"
            })
        }
    return {
        data : {
            
        }
    }
}