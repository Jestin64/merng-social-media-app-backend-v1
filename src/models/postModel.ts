import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    body: String,
    username: String,
    likes: [
        { username: String, createdAt: String }
    ],
    comments: [
        { body: String, username: String, createdAt: String }
    ],
    user: 
});


export const PostModel = mongoose.model('PostSchema', PostSchema)