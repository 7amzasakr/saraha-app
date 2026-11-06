import multer, { diskStorage } from "multer"
import { promises as FileSystem } from "node:fs";



export const uploadFile = (dest = "/general")=>{


    const storage = diskStorage({
        //destination : "./uploads/"+dest,
        destination:async(req,file,cb)=>{
            const userId = req.user?._id || ""
            const folderName = `./uploads/${dest}/${userId}`
            try{
                await FileSystem.access(folderName)
            }catch(error){
                await FileSystem.mkdir(folderName,{
                    recursive : true
                })
            }
            cb(null,folderName)
        },
        filename : (req,file,cb)=>{
            const username = req.user?.userName || ""
            const filename = username + "_" + Date.now()+ "_" + file.originalname
            cb(null,filename)
        }

    })











    return multer({
        storage
    })
}

export const callback = (err,name)=>{
    if(err){
        throw new Error(err);

    }
    console.log("hello"+name)
}