const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String }, 
    password: { type: String, required: false }, 
    profilePicture: { type: String, default: "" }, 
    githubId: { type: String, sparse: true, unique: true },
    googleId: { type: String, sparse: true, unique: true } // NEW: For Google users
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);