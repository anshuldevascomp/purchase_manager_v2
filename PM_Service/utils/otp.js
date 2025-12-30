
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const {otpCache} = require('../utils/otpCache');

async function sendOtpToEmail(email,identifier) {
    const otp = otpGenerator.generate(6, { digits: true, specialChars: false, lowerCaseAlphabets: false, upperCaseAlphabets: false });
    const key = `otp:${identifier}`;
    otpCache.set(key, otp);
    var transporter = nodemailer.createTransport({
      host: 'mail.ascomp.com', // Replace with your actual SMTP host
      port: 587, // Or 465 fmor SSL
      secure: false, // Set to 
      auth: {
        user: 'alert@ascomp.com',
        pass: 'Win32.exe'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  
    const mailOptions = {
      from: 'alert@ascomp.com',
      to: email,
      subject: 'Your OTP for Login',
      text: `Your OTP is ${otp} for enabling the System. This OTP will expire after 5 minutes.`
    };
  
    await transporter.sendMail(mailOptions);
    return true;
}

module.exports = {sendOtpToEmail}