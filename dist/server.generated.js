module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./server/controllers/check-auth.js":
/*!******************************************!*\
  !*** ./server/controllers/check-auth.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {
  AuthenticationError
} = __webpack_require__(/*! apollo-server */ "apollo-server");

const jwt = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken"); //const { SECRET_KEY } = require("../../config")


const SECRET_KEY = process.env.SECRET_KEY || 'GLORy to mankind'; //token expression pattern: context.req.headers.authorization.Bearer Token 

function authCheck(context) {
  const auth = context.req.headers.authorization;

  if (auth) {
    const token = auth.split('Bearer ')[1];

    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError('invalid/expired token');
      }
    } else {
      throw new Error("Authentication Error");
    }
  } else {
    throw new Error("Authorization header must be provided");
  }
}

module.exports = authCheck;

/***/ }),

/***/ "./server/controllers/validators.js":
/*!******************************************!*\
  !*** ./server/controllers/validators.js ***!
  \******************************************/
/***/ ((module) => {

//check for user correct data format
const validateRegisterData = (username, email, password, confirmPassword) => {
  let errors = {};
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (username.trim() === '') {
    errors.username = "Username cannot be empty";
  }

  if (email.trim() === "") {
    errors.email = "Email cannot be empty";
  } else if (!email.match(regEx)) {
    errors.email = "Please enter a valid email ";
  }

  if (password === '') {
    errors.password = "Passwords cannot be empty";
  } else if (password !== confirmPassword) {
    errors.password = "Passwords must match";
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors
  };
};

const validateLogin = (username, password) => {
  const errors = {};

  if (username.trim() === '') {
    errors.username = "Username cannot be empty";
  }

  if (password === "") {
    errors.password = "Password cannot be empty";
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors
  };
};

module.exports = {
  validateRegisterData,
  validateLogin
};

/***/ }),

/***/ "./server/graphql/resolvers/main.resolvers.js":
/*!****************************************************!*\
  !*** ./server/graphql/resolvers/main.resolvers.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const postResolvers = __webpack_require__(/*! ./post.resolvers.js */ "./server/graphql/resolvers/post.resolvers.js");

const userResolvers = __webpack_require__(/*! ./user.resolvers.js */ "./server/graphql/resolvers/user.resolvers.js");

const resolvers = {
  Post: {
    countLikes: parent => parent.likes.length,
    countComments: parent => parent.comments.length
  },
  Query: { ...userResolvers.Query,
    ...postResolvers.Query
  },
  Mutation: { ...userResolvers.Mutation,
    ...postResolvers.Mutation
  }
};
module.exports = resolvers;

/***/ }),

/***/ "./server/graphql/resolvers/post.resolvers.js":
/*!****************************************************!*\
  !*** ./server/graphql/resolvers/post.resolvers.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Post = __webpack_require__(/*! ../../models/post.model.js */ "./server/models/post.model.js");

const authCheck = __webpack_require__(/*! ../../controllers/check-auth.js */ "./server/controllers/check-auth.js");

const {
  AuthenticationError,
  UserInputError
} = __webpack_require__(/*! apollo-server */ "apollo-server");

const postResolvers = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({
          createdAt: -1
        });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getPost(_, {
      postId
    }) {
      if (postId.trim() === '') {
        throw new Error("please enter an id");
      } else {
        try {
          const post = await Post.findById(postId);
          if (post) return post;else throw new Error("Post not found!");
        } catch (err) {
          throw new Error(err);
        }
      }
    }

  },
  Mutation: {
    async createPost(_, {
      body
    }, context) {
      const user = authCheck(context);
      if (body.trim() === '') throw new UserInputError('Post body cannot be empty');
      const new_post = await Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString()
      });
      const post = await new_post.save();
      return post;
    },

    async editPost(_, {
      postId,
      body
    }) {
      if (body.trim() === '') throw new UserInputError('Post body cannot be empty');
      const updatedpost = await Post.findById(postId);

      if (updatedpost) {
        updatedpost.body = body;
        updatedpost.save();
        return updatedpost;
      }
    },

    async deletePost(_, {
      postId
    }, context) {
      const user = authCheck(context); //find the post first and validate that the user can delete only thier own posts!

      try {
        const post = await Post.findById(postId);

        if (post) {
          if (user.username === post.username) {
            post.delete();
            return 'Post Deleted';
          } else throw new AuthenticationError('Delete action on this post is not authorized');
        } else throw new Error("Oops Post not found");
      } catch (e) {
        throw new Error(e);
      }
    },

    async commentPost(_, {
      postId,
      body
    }, context) {
      const user = authCheck(context);
      if (body.trim() === '') throw new Error('Cannot post empty comment');

      try {
        const post = await Post.findById(postId);

        if (post) {
          post.comments.unshift({
            body,
            username: user.username,
            createdAt: new Date().toISOString()
          });
          await post.save();
          return post;
        } else throw new Error("Post does not exist");
      } catch (e) {
        throw new Error(e);
      }
    },

    async editComment(_, {
      postId,
      commentId,
      body
    }, context) {
      const user = authCheck(context);

      if (body.trim() === '') {
        throw new Error('Cannot post empty comment');
      }

      try {
        const post = await Post.findById(postId);

        if (post) {
          post.comments.map(comment => {
            comment.id === commentId ? comment.body = body : null;
          });
        }

        post.save();
        return post;
      } catch (e) {
        throw new Error(e);
      }
    },

    async deleteComment(_, {
      postId,
      commentId
    }, context) {
      const user = authCheck(context);

      try {
        const post = await Post.findById(postId);

        if (post) {
          const comment_index = post.comments.findIndex(comment => {
            if (comment.id == commentId) {
              return comment;
            }
          });

          if (user.username === post.comments[comment_index].username) {
            post.comments.splice(comment_index, 1);
            await post.save();
            return post;
          }
        } else throw new Error("Post does not exist");
      } catch (e) {
        throw new Error(e);
      }
    },

    async likePost(_, {
      postId
    }, context) {
      const user = authCheck(context);

      try {
        const post = await Post.findById(postId);

        if (post) {
          if (post.likes.find(like => like.username === user.username)) {
            post.likes = post.likes.filter(like => like.username !== user.username);
          } else {
            post.likes.push({
              username: user.username,
              createdAt: new Date().toISOString()
            });
          }

          await post.save();
          return post;
        } else {
          throw new Error(e);
        }
      } catch (e) {
        throw new Error(e);
      }
    }

  }
};
module.exports = postResolvers;

/***/ }),

/***/ "./server/graphql/resolvers/user.resolvers.js":
/*!****************************************************!*\
  !*** ./server/graphql/resolvers/user.resolvers.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const bscript = __webpack_require__(/*! bcryptjs */ "bcryptjs");

const jwt = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken");

const {
  UserInputError
} = __webpack_require__(/*! apollo-server */ "apollo-server");

const User = __webpack_require__(/*! ../../models/user.model.js */ "./server/models/user.model.js");

const Post = __webpack_require__(/*! ../../models/post.model.js */ "./server/models/post.model.js");

const authCheck = __webpack_require__(/*! ../../controllers/check-auth.js */ "./server/controllers/check-auth.js"); // const { SECRET_KEY } = require("../../../config.js")


const {
  validateRegisterData,
  validateLogin
} = __webpack_require__(/*! ../../controllers/validators.js */ "./server/controllers/validators.js");

const SECRET_KEY = process.env.SECRET_KEY || 'GLORy to mankind';

function generateToken(res) {
  return jwt.sign({
    id: res._id,
    username: res.username,
    email: res.email
  }, SECRET_KEY, {
    expiresIn: '1h'
  });
}

const userResolvers = {
  Query: {
    async getUsers() {
      try {
        const users = await User.find().sort({
          createdAt: -1
        });
        return users;
      } catch (e) {
        throw new Error(e);
      }
    }

  },
  Mutation: {
    async registerUser(_, {
      registerInput: {
        username,
        email,
        password,
        confirmPassword
      }
    }) {
      // user validation
      const {
        valid,
        errors
      } = validateRegisterData(username, email, password, confirmPassword);

      if (!valid) {
        throw new UserInputError('Errors', {
          errors
        });
      } // unique username


      const check = await User.findOne({
        username
      });

      if (check) {
        throw new UserInputError("Oops, username is already taken :(", {
          error: "Oops, username is already taken :("
        });
      } // password crypting and token gen


      password = await bscript.hash(password, 12);
      const new_user = new User({
        username,
        email,
        password,
        createdAt: new Date().toISOString()
      });
      const res = await new_user.save();
      const token = generateToken(res);
      return { ...res._doc,
        id: res._id,
        token
      };
    },

    async login(_, {
      username,
      password
    }) {
      const {
        valid,
        errors
      } = validateLogin(username, password);

      if (!valid) {
        throw new UserInputError("Error", {
          errors
        });
      }

      const user = await User.findOne({
        username
      });

      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", {
          errors
        });
      }

      const match = await bscript.compare(password, user.password);

      if (!match) {
        errors.general = "Incorrect Password";
        throw new UserInputError("Incorrect Password");
      } // console.log("logged in successfully")


      const token = generateToken(user);
      return { ...user._doc,
        id: user._id,
        token
      };
    },

    async deleteUser(_, {
      userId: id
    }) {
      try {
        const user = await User.findById(id);

        if (user) {
          // delete all posts the user has 
          const posts = await Post.find(); // retrieve all posts and loop through to find all posts made by the user and delete them

          if (posts) {
            posts.map(post => {
              if (post.username === user.username) {
                post.delete();
              }
            });
          }

          user.delete();
          return 'User Deleted';
        } else throw new Error("something went wrong");
      } catch (e) {
        throw new Error(e);
      }
    },

    async editUser(_, {
      editInput: {
        userId,
        username,
        email,
        password,
        confirmPassword
      }
    }) {
      const {
        valid,
        errors
      } = validateRegisterData(username, email, password, confirmPassword);

      if (!valid) {
        throw new Error(errors);
      } //generate new password hash and update 


      password = await bscript.hash(password, 12);

      try {
        const user = await User.findById(userId);
        const allposts = await Post.find(); // go through all the posts and change the usernames in post, like and comments

        allposts.map(post => {
          post.username === user.username ? post.username = username : null;
          post.likes.map(like => {
            like.username === user.username ? like.username = username : null;
          });
          post.comments.map(comment => {
            comment.username === user.username ? comment.username = username : null;
          });
          post.save();
        });
        const updatedUser = await User.findOneAndUpdate({
          _id: userId
        }, {
          username,
          email,
          password
        }, {
          new: true
        });
        return updatedUser;
      } catch (e) {
        throw new UserInputError(e);
      }
    }

  }
};
module.exports = userResolvers;

/***/ }),

/***/ "./server/graphql/typeDefs.js":
/*!************************************!*\
  !*** ./server/graphql/typeDefs.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {
  gql
} = __webpack_require__(/*! apollo-server */ "apollo-server");

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
`;
module.exports = typeDefs;

/***/ }),

/***/ "./server/models/post.model.js":
/*!*************************************!*\
  !*** ./server/models/post.model.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const mongoose = __webpack_require__(/*! mongoose */ "mongoose");

const postSchema = new mongoose.Schema({
  body: String,
  username: String,
  createdAt: String,
  comments: [{
    body: String,
    username: String,
    createdAt: String
  }],
  likes: [{
    username: String,
    createdAt: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    refs: 'users'
  }
});
module.exports = mongoose.model('Post', postSchema);

/***/ }),

/***/ "./server/models/user.model.js":
/*!*************************************!*\
  !*** ./server/models/user.model.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const mongoose = __webpack_require__(/*! mongoose */ "mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  createdAt: String
});
module.exports = new mongoose.model("User", userSchema);

/***/ }),

/***/ "./server/server.js":
/*!**************************!*\
  !*** ./server/server.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const Mongoose = __webpack_require__(/*! mongoose */ "mongoose");

const {
  ApolloServer
} = __webpack_require__(/*! apollo-server */ "apollo-server"); // const config = require("../config.js")


const typeDefs = __webpack_require__(/*! ./graphql/typeDefs.js */ "./server/graphql/typeDefs.js");

const resolvers = __webpack_require__(/*! ./graphql/resolvers/main.resolvers.js */ "./server/graphql/resolvers/main.resolvers.js");

const PORT = process.env.PORT || 3000;
const URI = process.env.MONGO_URL || `mongodb+srv://AaronBaron:AaronBaron@cluster0.syfka.gcp.mongodb.net/social-media-test?retryWrites=true&w=majority`;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: ({
    req
  }) => ({
    req
  })
});
Mongoose.connect(URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => {
  console.log("connected to MongoDB");
}).catch(err => {
  console.error(err);
});
server.listen(PORT, err => {
  if (err) {
    return console.log(err);
  }

  console.log("Connected to Server on port: ", PORT);
});

/***/ }),

/***/ "apollo-server":
/*!********************************!*\
  !*** external "apollo-server" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("apollo-server");;

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("bcryptjs");;

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("jsonwebtoken");;

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("mongoose");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./server/server.js");
/******/ })()
;