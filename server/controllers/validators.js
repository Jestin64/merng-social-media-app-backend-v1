//check for user correct data format

const validateRegisterData = (username, email, password, confirmPassword) => {
    let errors = {}
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if (username.trim() === '') {
        errors.username = "Username cannot be empty"
    }

    if (email.trim() === "") {
        errors.email = "Email cannot be empty"
    } else if (!email.match(regEx)) {
        errors.email = "Please enter a valid email "
    }

    if (password === '') {
        errors.password = "Passwords cannot be empty"
    } else if (password !== confirmPassword) {
        errors.password = "Passwords must match"
    }

    return {
        valid: Object.keys(errors).length < 1,
        errors
    }
}

const validateLogin = (username, password) => {
    const errors = {}

    if (username.trim() === '') {
        errors.username = "Username cannot be empty"
    }

    if(password === ""){
        errors.password = "Password cannot be empty"
    }

    return {
        valid: Object.keys(errors).length < 1,
        errors
    }
}

module.exports = { validateRegisterData, validateLogin }
