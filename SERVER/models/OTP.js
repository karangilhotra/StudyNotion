const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/mailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
        email:{
            type:String,
            required:true
        },
        otp:{
            type:String,
            required:true
        },
        createdAt:{
            type:Date,
            default:Date.now(),
            expires:5*60
        }

});

async function sendVerificationEmail(email,otp) {
    try{
        const mailResponse=await mailSender(email,"Verification Email from StudyNotion",emailTemplate(otp));
        console.log("Email send Successfully",mailResponse);
        
    }
    catch(err){
        console.log("error occur while sending mails ",err);
        throw err;
        
    }
}

OTPSchema.pre("save",async function (next) {
    await sendVerificationEmail(this.email,this.otp);
})

module.exports=mongoose.model("OTP",OTPSchema)