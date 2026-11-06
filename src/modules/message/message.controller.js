import { Router } from "express";
import { uploadFile } from "../../utils/multer.js";
import { sendMessage } from "./message.service.js";
import { successRes } from "../../utils/success.res.js";

const router = Router()
export const routes = {
    base:"/messages",
    send :"/send", //POST
}


router.post(routes.send,uploadFile("messages").array("images",5),async(req,res)=>{
    const {content,to}= req.body
    const images = req.files.map(ele =>ele.path)
    const {data} = await sendMessage(content,images,to)


    successRes({
        res,
        data
    })
})





export default router