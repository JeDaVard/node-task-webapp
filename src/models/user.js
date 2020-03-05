const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 6
    }
})

 userSchema.statics.findByCredentials = async function(email, password){
     const user = await User.findOne({email});
     if (!user) throw new Error('We haven\'t account with this email');
    
     if (password === undefined) throw new Error('Fill your password');
     const isMatchedPass = await bcrypt.compare(password, user.password);
     if (!isMatchedPass) throw new Error('Incorrect password');

     return user
 }
 
userSchema.pre('save', async function(next) {
    const user = this;
    
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next();
})

const User = mongoose.model('User', userSchema)

module.exports = User;