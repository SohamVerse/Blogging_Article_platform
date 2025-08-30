const { Schema, model } = require("mongoose");

const blacklistSchema = new Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete expired tokens

const Blacklist = model("Blacklist", blacklistSchema);
module.exports = Blacklist;
