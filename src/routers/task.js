const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        author: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/me/tasks', auth, async (req, res) => {
    try {
        await req.user.populate('myTasks').execPopulate()
        res.send(req.user.myTasks);
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks', async (req, res) => {
    try {
        const task = await Task.find({});
        res.send(task);
    } catch(e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id });
        res.send(task)
    } catch(e) {
        if (e.name === 'CastError') return res.status(404).send('Task not found');
        res.status(500).send(e)
    }
})

router.patch('/users/me/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'complated'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(400).send({error: 'invalid update types'});

    try {
        const task = await Task.findOne({ _id , author: req.user._id});
        if (!task) return res.status(404).send('Task not found');
        
        updates.forEach( update => task[update] = req.body[update])
        await task.save();

        res.send(task)
    } catch(e) {
        res.status(400).send('Bad request')
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOneAndDelete({ _id, author: req.user._id })
        if (!task) return res.status(400).send('Task not found');
        res.send('Successfully deleted this task' + task)
    } catch(e) {
        if (e.name === 'CastError') return res.status(404).send('Task not found');
        res.status(500).send(e)
    }
})

module.exports = router;