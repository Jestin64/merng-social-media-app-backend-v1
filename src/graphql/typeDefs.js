const { gql } = require("apollo-server")

const typeDefs = gql`
    type Query{
        getPosts: [Post]!
        getPost(postId:ID!): Post!
        getUsers: [User]!
    }

    type Post{
        id: ID!
        username: String!
        body: String!
        createdAt: String!
        comments: [Comment]!
        likes: [Like]!
        countLikes: Int!
        countComments: Int!
    }

    type Comment{
        id: ID!
        body: String!
        username: String!
        createdAt: String!
    }

    type Like{
        id: ID!
        username: String!
        createdAt: String!
    }

    type User{
        id: ID!
        username: String!
        email: String!
        token: String!
        createdAt: String!
    }

    input RegisterInput{
        username: String!
        email: String!
        password: String!
        confirmPassword: String!
    }

    input EditInput{
        userId: ID!
        username: String!
        email: String!
        password: String!
        confirmPassword: String!
    }

    type Mutation{
        registerUser(registerInput: RegisterInput!): User!
        editUser(editInput: EditInput!): User!
        deleteUser(userId: ID!): String!
        login(username: String!, password: String!): User!
        createPost(body: String!): Post!
        editPost(postId: ID!, body: String!): Post!
        editComment(postId:ID!, commentId: ID!, body: String!): Post!
        deletePost(postId: ID!): String!
        commentPost(postId: ID!, body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!
    }
`

module.exports = typeDefs