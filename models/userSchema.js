const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
    },
    password: String
}, { timestamps: true })

module.exports = mongoose.model('users', userSchema)