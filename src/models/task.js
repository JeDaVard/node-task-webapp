const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    }, 
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    complated: {
        type: Boolean,
        default: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

// taskSchema.pre('save', async function(n) {
//     // "this" is the current task
//     // here you can do whatever you want
//     //with the current task before it is saved on DB
    
//     n()
// })

const Task = mongoose.model('Task', taskSchema)


module.exports = Task