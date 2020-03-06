const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('./task');

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
    tasks: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId
            }
        }
    ],
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
})

userSchema.virtual('myTasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'author'
});

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

 //Hash before saving
userSchema.pre('save', async function(next) {
    const user = this;
    
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next();
})

//Delete tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({ author: user._id});

    next();
})

const User = mongoose.model('User', userSchema)

module.exports = User;