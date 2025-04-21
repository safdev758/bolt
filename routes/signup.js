const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Babysitter = require('../models/babysitter');
const Mother = require('../models/mother');
const multer = require('multer');
const upload = require('../middlewares/upload');
const { default: mongoose } = require('mongoose');
const nodemailer = require('nodemailer');

// Configure your transporter (update with your SMTP settings)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // your email address
    pass: process.env.EMAIL_PASS  // your email password or app-specific password
  }
});

// Helper function to send OTP email
async function sendOTPEmail(email) {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Your OTP Code',
    html : ` <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <h2 style="color: #4A90E2;">Hi there 👋</h2>
        <p>We're thrilled to welcome you to <strong>TOTRUST</strong>.</p>
        <p>You’ve just registered with this email: <strong>${email}</strong>.</p>
        <p><strong>If this wasn’t you</strong>, don’t worry — you can let us know and delete this account using the link below:</p>
        <p style="margin-top: 16px;">
          <a href="http://localhost:4000/delete?email=${encodeURIComponent(email)}" style="background-color: #E74C3C; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            Delete My Account
          </a>
        </p>
        <p style="margin-top: 20px;">If it *was* you — welcome aboard! You’re now part of a safe and caring community ❤️</p>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">This is an automated email. Please do not reply directly.</p>
      </div> `
  };
  return transporter.sendMail(mailOptions);
}

// Babysitter Registration
router.post('/register_babysitter', upload.single('profilePhoto'), async (req, res) => {
  const { 
    fullname, 
    phone_number, 
    agest, 
    email, 
    pref_location, 
    expst, 
    age_grps, 
    password, 
    confirmPassword, 
    national_card_number 
  } = req.body;

  if (!password || !confirmPassword || password.trim() !== confirmPassword.trim()) {
    return res.status(400).json({ message: "Passwords don't match" });
  }

  const parsedExp = parseInt(expst, 10);
  const parsedAge = parseInt(agest, 10);
  if (isNaN(parsedExp) || isNaN(parsedAge)) {
    return res.status(400).json({ message: 'Invalid number for exp or age' });
  }

  try {
    const existingBabysitter = await Babysitter.findOne({ email });
    if (existingBabysitter) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.ROUNDS, 10));
    const newBabysitter = new Babysitter({
      fullname,
      phone_number,
      age: parsedAge,
      email,
      pref_location,
      exp: parsedExp,
      age_grps: Array.isArray(age_grps) ? age_grps : JSON.parse(age_grps),
      password: hashedPassword,
      national_card_number,
      profilePhoto: req.file ? req.file.path : undefined,
    });

    await newBabysitter.save();
    // Send OTP email
    await sendOTPEmail(email);
    
    res.status(201).json({ message: 'Babysitter registered successfully. An OTP has been sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed', error });
  }
});

// Mother Registration
router.post('/register_mother', upload.single('profilePhoto'), async (req, res) => {
  const { fullname, phone_number, password, confirmPassword, email } = req.body;

  if (!password || !confirmPassword || password.trim() !== confirmPassword.trim()) {
    return res.status(400).json({ message: "Passwords don't match" });
  }

  try {
    const existingMother = await Mother.findOne({ email });
    if (existingMother) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.ROUNDS, 10));
    const newMother = new Mother({
      fullname,
      phone_number,
      email,
      password: hashedPassword,
      profilePhoto: req.file ? req.file.path : undefined,
    });

    await newMother.save();
    
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Send OTP email
    await sendOTPEmail(email, otp);
    
    res.status(201).json({ message: 'Mother registered successfully. An OTP has been sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering mother', error });
  }
});

// Debugging DB connection state
console.log("MongoDB Ready State:", mongoose.connection.readyState);

module.exports = router;
