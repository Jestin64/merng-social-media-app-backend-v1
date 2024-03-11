import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
    createdAt: String
})

const userModel = mongoose.model('userSchema', userSchema);

export default userModel;