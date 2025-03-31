import jwt from "jsonwebtoken";

const generateToken = (id, res) => {
    const token = jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "7d"});

    res.cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
        httpOnly: true, //cookie cannot be accessed by the browser, it prevents XSS attacks
        sameSite: true, //cookie is only sent in the same site, it prevents CSRF attacks
        secure: process.env.NODE_ENV === "production" ? true : false //cookie is only sent in production
    });

    return token;
}

export default{
    generateToken
}