export const userPrefixKey = (userId)=> `users : ${userId} : otp `
export const confrimEmailKey = (userId)=> `${userPrefixKey(userId)}:confimEmail`
export const resendOtpKey = (userId)=> `${userPrefixKey(userId)}:resend`
export const attemptsKey = (userId)=> `${userPrefixKey(userId)}:attempts`
export const attemptsBlockKey = (userId)=> `${userPrefixKey(userId)}:block`
export const attemptsBlockCountKey = (userId)=> `${userPrefixKey(userId)}:blockCount`


export const userSessionJwtIdPrefixKey = (userId)=>{
    return `users : ${userId} :session`
}

export const userSessionJwtIdKey = (userId,jwtid)=>{
    return `${userSessionJwtIdPrefixKey(userId)}:${jwtid}`
}