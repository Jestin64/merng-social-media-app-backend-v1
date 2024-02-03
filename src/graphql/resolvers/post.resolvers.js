const Post = require("../../models/post.model.js")
const authCheck = require("../../controllers/check-auth.js")
const { AuthenticationError,UserInputError } = require("apollo-server")


const postResolvers = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({ createdAt: -1 })
                return posts
            } catch (err) {
                throw new Error(err)
            }
        },

        async getPost(_, { postId }) {
            if (postId.trim() === '') {
                throw new Error("please enter an id")
            } else {
                try {
                    const post = await Post.findById(postId)
                    if (post)
                        return post
                    else throw new Error("Post not found!")
                } catch (err) {
                    throw new Error(err)
                }
            }
        }
    },

    Mutation: {
        async createPost(_, { body }, context) {
            const user = authCheck(context)

            if (body.trim() === '')
                throw new UserInputError('Post body cannot be empty')

            const new_post = await Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            })

            const post = await new_post.save()
            return post
        },

        async editPost(_, {postId, body}){
            if(body.trim() === '')
                throw new UserInputError('Post body cannot be empty')

            const updatedpost = await Post.findById(postId)
            if(updatedpost){
                updatedpost.body = body
                updatedpost.save()
                return updatedpost
            }
        },

        async deletePost(_, { postId }, context) {
            const user = authCheck(context)
            //find the post first and validate that the user can delete only thier own posts!
            try {
                const post = await Post.findById(postId)
                if (post) {
                    if (user.username === post.username) {
                        post.delete()
                        return 'Post Deleted'
                    } else throw new AuthenticationError('Delete action on this post is not authorized')
                } else throw new Error("Oops Post not found")
            } catch (e) {
                throw new Error(e)
            }
        },

        async commentPost(_, { postId, body }, context) {
            const user = authCheck(context)
            if (body.trim() === '')
                throw new Error('Cannot post empty comment')

            try {
                const post = await Post.findById(postId)
                if (post) {
                    post.comments.unshift({
                        body,
                        username: user.username,
                        createdAt: new Date().toISOString()
                    })
                    await post.save()
                    return post
                } else throw new Error("Post does not exist")
            } catch (e) {
                throw new Error(e)
            }
        },

        async editComment(_, {postId, commentId, body}, context){
            const user = authCheck(context)
            if(body.trim() === ''){
                throw new Error('Cannot post empty comment')
            }
            try{
                const post = await Post.findById(postId)
                if(post){
                    post.comments.map(comment=>{
                        comment.id === commentId ? comment.body = body : null
                    })                  
                }
                post.save()
                return post
            } catch(e){
                throw new Error(e)
            }
        },

        async deleteComment(_, { postId, commentId }, context) {
            const user = authCheck(context)

            try {
                const post = await Post.findById(postId)
                if (post) {
                    const comment_index = post.comments.findIndex(comment => {
                        if (comment.id == commentId) {
                            return comment
                        }
                    })
                    if (user.username === post.comments[comment_index].username) {
                        post.comments.splice(comment_index, 1)
                        await post.save()
                        return post
                    }
                } else
                    throw new Error("Post does not exist")
            } catch (e) {
                throw new Error(e)
            }
        },

        async likePost(_, {postId}, context){
            const user = authCheck(context)
            
            try{
                const post = await Post.findById(postId)
                if(post){
                    if(post.likes.find(like => like.username === user.username)){
                        post.likes = post.likes.filter(like => like.username !== user.username)
                    } else {
                        post.likes.push({
                            username: user.username,
                            createdAt: new Date().toISOString()
                        })
                    }
                
                await post.save()
                return post
                } else {
                    throw new Error(e)
                }
            } catch(e){
                throw new Error(e)
            }

        }

    }
}

module.exports = postResolvers