import { userModel } from "../../DB/models/user.model.js"
import { errorRes } from "../../utils/error.handel.js"
import jwt from "jsonwebtoken"
import { decodeToken } from "../../middlewares/auth.midddleware.js"
import { tokenEnum } from "../../middlewares/auth.midddleware.js"



export const signupService = async ({fullname , email , gender,password , phone , bio ,age , userName })=>{
        // const isExist = Promise.all([

        // ]) 

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

    const user = await userModel.create({
        fullname,email,password,gender,phone,bio, age , userName
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

    if(user.password != password){
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