const UserModel = require("../models/userModel");
const Blacklist = require("../models/blacklistModel");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");

const loginUser = async (req, res) => {
  try {
    console.log('Login attempt with:', { email: req.body.email, hasPassword: !!req.body.password });
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email });
    console.log('User found:', !!user);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log('Tokens generated successfully');
    
    res.json({
      message: "Login successful",
      user: { 
        _id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        preferences: user.preferences
      },
      token: accessToken,
      accessToken,
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (token) {
      // Add token to blacklist
      const blacklistedToken = new Blacklist({ token });
      await blacklistedToken.save();
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken");
    
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error('Error in logoutUser:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await UserModel.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user._id);
    
    res.json({
      message: "Token refreshed successfully",
      token: newAccessToken,
      user: { 
        _id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Error in refreshToken:', error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

const verifyToken = async (req, res) => {
  try {
    // User is already authenticated by the protect middleware
    const user = req.user;
    
    res.json({
      message: "Token verified successfully",
      user: { 
        _id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Error in verifyToken:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const crypto = require("crypto");
const nodemailer = require("nodemailer");

const forgotPassword = async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset/${resetToken}`;
  
  // Send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset",
    text: `Reset password at: ${resetUrl}`,
  });

  res.json({ message: "Reset email sent" });
};

const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await UserModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};

module.exports = {
  loginUser,
  logoutUser,
  refreshToken,
  verifyToken,
  forgotPassword,
  resetPassword,
};