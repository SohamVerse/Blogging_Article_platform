const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1d",
  });
};

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

module.exports = { generateAccessToken, generateRefreshToken,generateToken };


