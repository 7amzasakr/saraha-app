import nodemailer from "nodemailer"


export const sendEmail = async ({to, subject, html}) => {
    const transporter = nodemailer.createTransport({
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.PASS,
        },
        service: "gmail",
    })

    return transporter.sendMail({
        from: "saraha app <saraha@gmail.com>",
        to,
        subject,
        html,
    })
}

//"saraha app <saraha@gmail.com>"