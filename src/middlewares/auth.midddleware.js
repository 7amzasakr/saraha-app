import jwt from "jsonwebtoken";
import { userModel } from "../DB/models/user.model.js";
import { errorRes } from "../utils/error.handel.js";
import { userSessionJwtIdKey} from "../utils/redis-servces.js";
import { redisClient } from "../DB/redis.connect.js";

export const tokenEnum = {
    access : "access",
    refresh  : "refresh"
}


export const auth = async(req,res,next)=>{
    const {user,jti } = await decodeToken({authorization:req.headers.authorization})
    req.user = user
    req.jti = jti
    next()

}

export const decodeToken = async ({authorization, tokenType = "access"})=>{

    if(!authorization || !authorization.startsWith("Bearer ")){
       return errorRes({msg: "invalid token", statusCode:401})
    }

    const token = authorization.split(" ")[1]
    //console.log({token});

    const payload = jwt.verify(token,tokenType === tokenEnum.access ? process.env.ACCESS_TOKEN_SECRET:process.env.REFRESH_TOKEN_SECRET)

    // console.log({token});
    const user = await userModel.findById(payload._id)
   // console.log(user);
    if(!user){
        errorRes({
            msg : "user not foun",statusCode : 404
        })
    }

    if(!user.confirmedAt){
        errorRes({
            msg : "confirm first",
            statusCode:401
        })
    }

    const {jti } = payload
    if(!jti){
        errorRes({msg:"in-valid token",statusCode:400})
    }
    const redisJti = await redisClient.get(userSessionJwtIdKey(user._id,jti))
    if(!redisJti){
         errorRes({msg:"logged out login again",statusCode:400})
    }
    return {
        user,
        jti
    }
}

export const authorization = (...roles)=>{
    return (req,res,next)=>{
        console.log({roles,userRole  :req.user.role});
        
        if(!roles.includes(req.user.role)){
            errorRes({
                msg : "unauthorized",
                statusCode : 401
            })
        }
        next();
    }
}

