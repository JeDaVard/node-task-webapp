const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/user/task', auth, async (req, res) => {
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

router.get('/me/tasks', auth, async (req, res) => {
    const match = {};
    const sort ={};

    if (req.query.complated) {
        match.complated = req.query.complated === 'true'
    }
    if (req.query.sort) {
        const parts = req.query.sort.split('-');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    try {
        await req.user.populate({
            path: 'myTasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            }
        }).execPopulate()
        res.send(req.user.myTasks);
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks', async (req, res) => {
    const sort ={};
    if (req.query.sort) {
        const parts = req.query.sort.split('-');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    try {
        const tasks = await Task.find(
            {},
            null,
            {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            });
        res.send(tasks);
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

router.patch('/me/tasks/:id', auth, async (req, res) => {
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

router.delete('/me/tasks/:id', auth, async (req, res) => {
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