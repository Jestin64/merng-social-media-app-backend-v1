const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    createdAt: String
})

module.exports = new mongoose.model("User", userSchema)