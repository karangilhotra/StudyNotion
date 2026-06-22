const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User");

//isAuth
exports.auth=async (req,res,next) => {
    try{
        //extract token
        const token = (req.header("Authorization") ? req.header("Authorization").replace("Bearer ", "") : null)
                || req.cookies.token
                || (req.body && req.body.token);
        // if token missing then return response
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is missing",
            })
        }  
        
        //verify token
        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user=decode;
            
        }
        catch(err){
            // verification issue
            return res.status(401).json({
                success:false,
                message:"Token is invalid "
            })
        }
        next();
    }
    catch(err){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while validating the token"
        })
    }
}



//isStudent
exports.isStudent= async (req,res,next) => {
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for student only"
            })
        }
        next();
    }
    catch(err){
        return res.status(401).json({
            success:false,
            message:"User role cannot be verified,please try again"
        })
    }
}

//isInstructor
exports.isInstructor= async (req,res,next) => {
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Instructor  only"
            })
        }
        next();
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified,please try again",
            message:err.message
        })
    }
}


//isAdmin
exports.isAdmin= async (req,res,next) => {
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for admin only"
            })
        }
        next();
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified,please try again",
            message:err.message
        })
    }
}