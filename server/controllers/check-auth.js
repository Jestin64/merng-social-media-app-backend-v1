const { AuthenticationError } = require("apollo-server")
const jwt = require("jsonwebtoken")

//const { SECRET_KEY } = require("../../config")

const SECRET_KEY = process.env.SECRET_KEY || 'GLORy to mankind'

//token expression pattern: context.req.headers.authorization.Bearer Token 
function authCheck(context) {
    const auth = context.req.headers.authorization
    if (auth) {
        const token = auth.split('Bearer ')[1]
        if (token) {
            try{
                const user = jwt.verify(token, SECRET_KEY)
                return user
            } catch(err){
                throw new AuthenticationError('invalid/expired token')
            }
            
        } else {
            throw new Error("Authentication Error")
        }
    } else {
        throw new Error("Authorization header must be provided")
    }
}

module.exports = authCheck