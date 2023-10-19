const express = require("express");
const User = require("../model/user.js");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const generateToken = require("../utils/utils.js");
const verifyToken = require("../middleware/middle.js");

router.get("/test", (req, res) =>
  res.json({ message: "API Testing Successfully" })
);

router.post("/user", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({ message: "User Created" });
  }
  res.status(409).json({ message: "User already exists" });
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect Password" });
  }
  const token = generateToken(user);
  res.json({ token });
});

router.get("/data", verifyToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}! This is protected data` });
});

router.post("/reset", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const token = Math.random().toString(36).slice(-8);
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 360000; // 1 hour

  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ramdevcse25@gmail.com",
      password: "fyyy znvg jypt yain",
    },
  });
  const message = {
    from: "ramdevcse25@gmail.com",
    to: user.email,
    subject: "Password Reset Request",
    text: `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\nPlease use the following token to reset your password: ${token}\n\nIf you did not request a password reset, please ignore this email`,
  };
  transporter.sendMail(message, (err, info) => {
    if (err) {
      res.status(500).json({ message: "Something went wrong, Try again!" });
    } else {
      res.status(200).json({ message: "Password reset Email sent" + info.response });
    }
  });
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid token" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  res.json({ message: "Password reset Successful" });
});

module.exports = router;
