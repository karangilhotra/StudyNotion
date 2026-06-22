const User=require("../models/User");
const OTP=require("../models/OTP");
const otpGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const mailSender=require("../utils/mailSender");
const Profile=require("../models/Profile");
require("dotenv").config();
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
//send otp
exports.sendOTP= async (req,res) => {
    try{
        // fetch email from req body
        const {email} = req.body;

        // check if user already present or not
        const checkUserPresent=await User.findOne({email});

        //if user already exist then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered'
            })
        }

        // to generate otp

        var otp=otpGenerator.generate(6,{
            lowerCaseAlphabets:false,
            upperCaseAlphabets:false,
            specialChars:false,
        });
        console.log("otp genearted",otp);

        //to check otp unique or not

        const result =await OTP.findOne({otp:otp});

        while(result){
            otp=otpGenerator.generate(6,{
                lowerCaseAlphabets:false,
                upperCaseAlphabets:false,
                specialChars:false,
            });
            result =await OTP.findOne({otp:otp});
        }

        const otpPayload={email,otp};
        
        //create an entry of otp

        const otpBody= await OTP.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp
        })
        
        
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message
        })
        
    }

}

//signup

exports.signUp= async (req,res) => {
    try{
        //fetch data from request ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        }=req.body;


        //validate
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }

        //both password match
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and ConfirmPassword doesnot match"
            })
        }


        //check user already exist or not
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already registered"
            })
        }
        //find most recent otp stored for the user  
        const recentOtp=await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);

        
        
        //validate otp
        if(recentOtp.length===0){
            //otp not found
            return res.status(400).json({
                success:false,
                message:"OTP not found"
            })
        }
        else if(otp!==recentOtp.otp){
            return res.status(400).json({
                success:false,
                message:"not match"
            })
        }
        
        //hash password

        const hashPassword=await bcrypt.hash(password,10);
        //entry create in db

        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        });

        const user=await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}  ${lastName}`
        })

        //return res
        return res.status(200).json({
            success:true,
            message:'User registered successfully',
            user
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:'User cannot be registered successfully, please try again later',
            message:err.message
        })
    }
}

//login

exports.login=async (req,res) => {
    try{
        //get data from req body
        const {email,password}=req.body;
        //validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All field are required, please try again"
            })
        }
        //user check exist or not 
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first"
            })
        }
        //generate JWT after password checking
        if(await bcrypt.compare(password,user.password)){
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType
            }
            const token=jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            })
            user.token=token;
            user.password=undefined;

            //create cookie and send response

            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"LOgin successfully"
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect"
            })
        }
        
    }
    catch(err){
        console.log(err.message);
        
        return res.status(500).json({
            success:false,
            message:"Login failed,please try again",
            message:err.message,
        })

    }
}

//change password
exports.changePassword=async (req,res) => {
    try{
        //get data from req body
        const userDetails=await User.findById(req.user.id);

        //get old password,new password,confirm password
        const {oldPassword,newPassword}=req.body;

        //validate
        const isPasswordMatch=await bcrypt.compare(
            oldPassword,
            userDetails.password,
        )
        if(!isPasswordMatch){
            // If old password does not match, return a 401 (Unauthorized) error
            return res.status(401).json({ 
                success: false, 
                message: "The password is incorrect" 
            })
        }

        //update pwd to DB
        const encryptedPassword = await bcrypt.hash(newPassword, 10)
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        )

        //send email password updated
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            )
            console.log("Email sent successfully:", emailResponse.response)
        } 

        catch (error) {
            console.error("Error occurred while sending email:", error)
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            })
        }

        //return response
        return res.status(200).json({ 
            success: true, 
            message: "The password updated successfully" 
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating email",
            error: error.message,
        })
    }
    
}