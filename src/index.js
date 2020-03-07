const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const path = require('path');
const hbs = require('hbs');

const app = express();
const port = process.env.PORT || 3000;

const publicDirPath = path.join(__dirname, '../public');
const partialPath = path.join(__dirname, '../templates/partials');
const viewsDirPath = path.join(__dirname, '../templates/views');

app.set('view engine', 'hbs');
app.set('views', viewsDirPath);
hbs.registerPartials(partialPath);

app.use(express.static(publicDirPath));
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.get('', (req, res) => {
    res.render('index', {
        title: 'Weather',
        name: 'Davit Vardanyan'
    })
})

app.listen(port, () => {
    console.log('server is up on port ' + port)
})