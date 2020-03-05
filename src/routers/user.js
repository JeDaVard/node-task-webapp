const express = require('express');
const User = require('../models/user');
const router = new express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        const token = await user.authToken();
        res.status(201).send({ user, token })
    } catch(e) {
        res.status(400).send(e)
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.authToken();

        res.send({ user, token });
    } catch(e) {
        res.status(500).send('Undefined yet' + e)
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users)
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        res.send(user)
    } catch(e) {
        if (e.name === 'CastError') return res.status(404).send('User not found');
        res.status(500).send(e)
    }
})

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['userName', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(400).send({error: 'Invalid updates'})

    try {
        const user = await User.findById(req.params.id);
        
        updates.forEach((update) => user[update] = req.body[update])
        await user.save();
        
        res.send(user);
    } catch(e) {
        if (e.name === 'CastError') return res.status(404).send('User not found');
        res.status(400).send(e);
    }
})

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        res.send(user)
    } catch(e) {
        if (e.name === 'CastError') return res.status(404).send('User not found');
        res.status(500).send(e)
    }
})

module.exports = router;