import {hash,compare}from 'bcrypt';
import { verify } from "argon2"
// import { hash } from "argon2"





export const createHash = async (password,)=>{
    const generatedHash = await hash(password,10)
    // const generatedHash = await hash(password,{
    //     memoryCost :1024 * 1024 //1MB
    // })
    return generatedHash
}



export const compareHash = async (password, hashedPassword)=>{
    const isMatch = await compare(password,hashedPassword)
    //const isMatch = await verify(hashedPassword,password);
    return isMatch
}