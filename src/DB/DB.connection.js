import mongoose from "mongoose";

export const DBConnection = async ()=>{
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/saraha",{
            serverSelectionTimeoutMS:5000
        })
        console.log("db is connection successfully")
    }catch(err){
        console.log("db connection failed => ",err)
    }
}