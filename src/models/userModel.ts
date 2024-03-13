import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
    createdAt: String
})

export const User = mongoose.model('userSchema', userSchema);
