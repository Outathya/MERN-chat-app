import jwt from "jsonwebtoken"

export const generatetoken =  (userId, res)=>{

    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn : "7d",
    })

    res.cookie("jwt", token,{
        maxAge : 7 * 24 * 60 * 1000, // milliseconds
        httpOnly : true, // prevent XSS attacks cross-site scripting
        sameSite : "strict" ,
        secure: process.env.NODE_ENV !== "development"
    });

    return token;
 

}
