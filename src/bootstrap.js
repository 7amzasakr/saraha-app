import express from "express"

import cors from "cors"
import { DBConnection } from "./DB/DB.connection.js"
import messageRouter, { routes as messageRoutes } from './modules/message/message.controller.js'
import userRouter, { routes as userRoutes } from "./modules/User/user.controller.js"




const bootstrap = async()=>{
    const app = express()
    const port = process.env.PORT
    app.use(express.json());
    await DBConnection();
    app.get('/',(req,res)=>res.send("hello world "))
    app.use(cors({
        origin:"*"
    }))
    app.use(userRoutes.base,userRouter)
    app.use(messageRoutes.base,messageRouter)
    //await redisClient.set("t", "h")
    

    app.use((err,req,res,next)=>{
        const statusCode = err.cause?.statusCode || 500
        res.status(statusCode).json({
            errMsg : err.message,
            status : statusCode,
            errOptions : err.cause?.options
        })
    })

    //sendEmail({to :"hamzaalisakr06@gmail.com",subject:"confirm email",html:emailTemplate({otp:123456,subject : "confirm email"})})

    // await sendEmail({
    //     to: "jj@mohmal.in",
    //     subject: "confirm email",
    //     html: emailTemplate({
    //         otp: 123456,
    //         subject: "confirm email"
    //     })
    // });

    app.listen(port,()=>{
        console.log(`example app listening on port ${port}`)
    })

}

export default bootstrap