const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
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
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
})

userSchema.methods.authToken = async function() {
    const token = jwt.sign({_id: this.id.toString()}, 'secondNode');
    this.tokens = this.tokens.concat( {token} );
    await this.save();
    
    return token;
}

 userSchema.statics.findByCredentials = async function(email, password){
     const user = await User.findOne({email});
     if (!user) throw new Error('We haven\'t account with this email');
    
     if (password === undefined) throw new Error('Fill your password');
     const isMatchedPass = await bcrypt.compare(password, user.password);
     if (!isMatchedPass) throw new Error('Incorrect password');

     return user;
 }
 
 userSchema.methods.toJSON = function() {
     const {name, email} = this.toObject();

    return {
        name,
        email
    }
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