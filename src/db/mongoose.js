const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_STORAGE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})