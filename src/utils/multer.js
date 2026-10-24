import multer, { diskStorage } from "multer"




export const uploadFile = (dest = "/general")=>{


    const storage = diskStorage({
        destination : "./uploads/"+dest,
        filename : (req,file,cb)=>{
            const username = req.user.username
            const filename = username + " _ " + Date.now() + file.originalname
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