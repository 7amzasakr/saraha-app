import express from "express"

import setRouter , {routes as userRoutes} from "./modules/User/user.controller.js"
import { DBConnection } from "./DB/DB.connection.js"
import { userModel } from "./DB/models/user.model.js"






const bootstrap = async()=>{
    const app = express()
    const port = process.env.PORT
    app.use(express.json());
    await DBConnection();
    app.get('/',(req,res)=>res.send("hello world "))
    
    app.use(userRoutes.base,setRouter)
    
    

    app.use((err,req,res,next)=>{
        const statusCode = err.cause?.statusCode || 500
        res.status(statusCode).json({
            errMsg : err.message,
            status : statusCode,
            errOptions : err.cause?.options
        })
    })



    app.listen(port,()=>{
        console.log(`example app listening on port ${port}`)
    })

}

export default bootstrap