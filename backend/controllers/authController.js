const Blacklist = require("../models/blacklistModel");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");

const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "No token provided" });

    const decoded = jwt.decode(token);
    if (!decoded) return res.status(400).json({ message: "Invalid token" });

    await Blacklist.create({
      token,
      expiresAt: new Date(decoded.exp * 1000), // exp from JWT payload
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({
    message: "Login successful",
    user: { _id: user._id, username: user.username, email: user.email, role: user.role },
    accessToken,
  });
};

// Refresh route
const refreshAccessToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const accessToken = generateAccessToken(decoded.id);
    res.json({ accessToken });
  });
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
  logoutUser,
  loginUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
};