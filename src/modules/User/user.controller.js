import { Router } from "express";
import {successRes}from "../../utils/success.res.js"
import { loginService, signupService ,refreshToken} from "./user.service.js";
import { auth, decodeToken } from "../../middlewares/auth.midddleware.js";
const router = Router();

export const routes ={
    base : "/users",
    signup : "/signup", //POST
    login : "/login",
    me : "/me", // GET
    refreshToken  : "/refresh-token", //POST
}


router.post(routes.signup, async (req,res)=>{
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


router.get(routes.me,auth ,async (req,res)=>{
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

export default router