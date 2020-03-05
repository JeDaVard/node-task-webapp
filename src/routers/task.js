const express = require('express');
const router = new express.Router();
const Task = require('../models/task')

router.post('/tasks', async (req, res) => {
    const task = new Task(req.body);

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
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

router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findById(_id);
        res.send(task)
    } catch(e) {
        if (e.name === 'CastError') return res.status(404).send('Task not found');
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'complated'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(400).send({error: 'invalid update types'});

    try {
        const task = await Task.findById(_id);

        updates.forEach( update => task[update] = req.body[update])
        await task.save();

        res.send(task)
    } catch(e) {
        if (e.name === 'CastError') return res.status(404).send('Task not found');
        res.status(400).send('Bad request')
    }
})

router.delete('/tasks/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findByIdAndDelete(_id);
        res.send(task)
    } catch(e) {
        if (e.name === 'CastError') return res.status(404).send('Task not found');
        res.status(500).send(e)
    }
})

module.exports = router;