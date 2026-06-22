const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");


//resetPasswordToken
exports.resetPasswordToken=async (req,res) => {
    try{
        //getemail from req body
        const email=req.body.email;
        //check user for this email, email verification
        const user=await User.findOne({email:email});
        if(!user){
            return res.json({
                success:false,
                message:"Your email is not registered with us"
            })
        }
        //generate token
        const token =crypto.randomUUID();
        //update user by adding tokennad expiration time
        const updatedDetails=await User.findOneAndUpdate(
            {email:email},
            {
                token:token,
                resetPasswordExpires:Date.now()+ 5*60*1000
            },
            {new:true}
        )
        //create url
        const url= `http://localhost:5173/update-password/${token}`
        //send mail containing the url
        await mailSender(email,
                        "Pasword Reset Link",
                        `Password Reset Link ${url}`
        )
        //return response
        return res.json({
            success:true,
            message:"email send successfully, please check email and change pwd"
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while reset pwd"
        }); 
    }
}

//resetPassword
exports.resetPassword=async (req,res) => {
    try{
        // data fetch
        const {password,confirmPassword,token}=req.body;
        // validation
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:"Password doesnot match"
            });
        }
        // get user details from db using token
        const userDetails=await User.findOne({token:token});
        // if no entry - invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"token invalid"
            });
        }
        // token time clock
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:"token expires , generate your token"
            });
        }
        // hash pwd
        const hashPassword = await bcrypt.hash(password,10);
        // password update 
        await User.findOneAndUpdate(
            {token:token},
            {password:hashPassword},
            {new:true}
        )
        // return response
        return res.status(200).json({
            success:true,
            message:"password reset successsfully"
        });
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while reset pwd"
        })

    }
}
