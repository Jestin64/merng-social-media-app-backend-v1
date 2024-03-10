const postResolvers = require("./post.resolvers.js")
const userResolvers = require("./user.resolvers.js")

const resolvers = {
    Post: {
        countLikes: (parent) => parent.likes.length,
        countComments: (parent) => parent.comments.length
    },
    Query: {
        ...userResolvers.Query,
        ...postResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...postResolvers.Mutation
    }
}

export default resolvers;