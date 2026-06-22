//import required modules
const express=require("express");
const router=express.Router();

//import required controllers and middleware function
const {
    login,
    signUp,
    sendOTP,
    changePassword,
}=require("../controllers/Auth");

const {
    resetPasswordToken,
    resetPassword,
}=require("../controllers/ResetPassword");

const {auth} = require("../middlewares/auth");

//routes for login, signup and authentication

// Route for User login
router.post("/login",login);

// Route for User signup
router.post("/signUp",signUp);

// Route for Sending OTP to the user's email 
router.post("/sendOTP",sendOTP);

// Route for Change Passwoed 
router.post("/changePassword",auth,changePassword);

// Route for generating a reset-Passwoed token 
router.post("/reset-password-token",resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password",resetPassword);

// export the router for use in main application
module.exports=router;