const dB = require('../app_module/dbHelp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { sendOtpToEmail } = require('../utils/otp')
const {otpCache} = require('../utils/otpCache');

exports.login = async (req, res) => {
  const { identifier, browserkey } = req.body;

  if (!identifier || !browserkey) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  try {
    const [rows] = await dB.query(
      `SELECT * FROM ContactMaster WHERE email = ? OR phone = ?`,
      [identifier, identifier]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.webkey) {
      return res.status(401).json({ message: 'User is not registered with a device' });
    }

    // Option A: Store raw browser keys in DB and compare them
    if (user.webkey !== browserkey) {
      return res.status(401).json({ message: 'User is logged in on another device' });
    }

    // Option B: If webkey is a JWT, verify it
    // try {
    //   jwt.verify(user.webkey, process.env.ACCESS_TOKEN_SECRET);
    // } catch (err) {
    //   return res.status(401).json({ message: 'Invalid or expired device token' });
    // }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.sendOtp = async (req, res) => {
  try {
    const { identifier } = req.body;
    const [rows] = await dB.executeMultipleSelectQuery(`Select * from ContactMaster where email = '${identifier}' or phone = '${identifier}'`)
    const {Email: email } = rows['data'][0]
    await sendOtpToEmail(email,identifier);
    res.json({
      message: "OTP has been sent successfully to your registered email address. Please validate the OTP.",
      otpRequired: true
    });
  }catch(err){
    res.status(500).json({ message: 'Invalid credentials', error: err });
  }
 
};
exports.sendOtpToAdmin = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ message: 'Missing identifier' });
    // const [rows] = await dB.executeMultipleSelectQuery(`Select * from ContactMaster where email = '${identifier}' or phone = '${identifier}'`)
    // const {Email: email } = rows['data'][0]
    await sendOtpToEmail(identifier,identifier);
    res.json({
      message: "OTP has been sent successfully to your registered email address. Please validate the OTP.",
      otpRequired: true
    });
  }catch(err){
    res.status(500).json({ message: 'Invalid credentials', error: err });
  }
 
};


exports.verifyOtp = async (req, res) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp) return res.status(400).json({ message: 'Required fields missing' });

  const key = `otp:${identifier}`;
  const storedOtp = otpCache.get(key);

  if (!storedOtp) return res.status(400).json({ message: 'OTP expired or not found' });
  if (storedOtp != otp){
    return res.status(401).json({ message: 'Invalid OTP' });
  }else{
    const userData = await getUserData(identifier);
    res.status(200).json({ message: 'OTP verified successfully', data: userData });
  }
};

exports.verifyOtpAdmin = async (req, res) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp) return res.status(400).json({ message: 'Required fields missing' });

  const key = `otp:${identifier}`;
  const storedOtp = otpCache.get(key);

  if (!storedOtp) return res.status(400).json({ message: 'OTP expired or not found' });
  if (storedOtp != otp){
    return res.status(401).json({ message: 'Invalid OTP' });
  }else{
    res.status(200).json({ message: 'OTP verified successfully'});
  }
};

async function getUserData(identifier){
  const [rows] = await dB.executeMultipleSelectQuery(`Select * from ContactMaster where email = '${identifier}' or phone = '${identifier}'`)
  return rows['data'][0]
}

