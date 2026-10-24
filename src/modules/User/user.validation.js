import z from "zod";
import { GenderEnum } from "./user.types.js";



export const signupScema = {
    body: z.object({
            fullname : z.string(),
            email:z.email(),
            phone: z.string().min(10).max(15),
            password:z.string(),
            age: z.number().optional(),
            gender : z.enum(GenderEnum),
            userName :z.string(),
            bio : z.string().optional(),
            confirmPassword : z.string()
    })
    .refine((arg)=>arg.password == arg.confirmPassword,{error : "password missmatch",
        path : ["password","confirmPassword"]
    })
}

export const resetPasswordSchema = {
    body : z.strictObject({
        email:z.email(),
        otp : z.string().min(6).max(6),
        password: z.string(),
        confirmPassword : z.string()
    }).refine((arg)=>arg.password == arg.confirmPassword,{error : "password missmatch",
        path : ["password","confirmPassword"]
    })
}
