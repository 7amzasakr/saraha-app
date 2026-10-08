import crypto from "node:crypto"
import { errorRes } from "../error.handel.js"







const secreteKey = Buffer.from("lnlknknklniuhcrerealkofrsxcnclZX")
export const encryption = (data)=>{
    // const iv = crypto.randomBytes
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-cbc",secreteKey,iv)
    let cipherText = cipher.update(data,"utf8","hex")
    cipherText += cipher.final("hex")

    return `${iv.toString("hex")}:${cipherText}`
}


export const decryption = (encryptedValue)=>{
    const [iv,cipherText]= encryptedValue.split(":")
    if(!iv || !cipherText){
        errorRes({
            msg:"invalid encrypted value"
        })
    }
    const binaryIv = Buffer.from(iv,"hex")
    const deciphe = crypto.createDecipheriv("aes-256-cbc",secreteKey,binaryIv)
    let plaintext = deciphe.update(cipherText,"hex","utf8")
    plaintext += deciphe.final("utf8")

    return plaintext

}