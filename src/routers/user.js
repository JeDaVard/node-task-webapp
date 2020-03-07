const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendByeEmail } = require('../emails/account');
const router = new express.Router();

router.post('/me', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        
        sendWelcomeEmail(user.email, user.name);
        const token = await user.authToken();

        res.status(201).send({ user, token })
    } catch(e) {
        res.status(400).send({error: `something went wrong (${e})`})
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.authToken();
        
        res.send({ user, token });
    } catch(e) {
        res.status(500).send(e)
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter( token => token.token !== req.token );
        await req.user.save();

        res.status(200).send('Logged out');
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.status(200).send('Logged out from all devices');
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/me', auth, async (req, res) => {
    res.send(req.user);
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find(
            {},
            null,
            {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            });
        res.send(users);
    } catch(e) {
        res.status(500).send(e)
    }
});

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        res.send(user)
    } catch(e) {
        if (e.name === 'CastError') return res.status(404).send('User not found');
        res.status(500).send(e)
    }
});

router.patch('/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(400).send({error: 'Invalid updates'})

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save();
        
        res.send(req.user);
    } catch(e) {
        res.status(400).send(e);
    }
})

router.delete('/me', auth, async (req, res) => {
    try {
        await req.user.remove();

        sendByeEmail(req.user.email, req.user.name);
        
        res.send('Your profile was successfully deleted');
    } catch(e) {
        res.status(500).send(e);
    }
});

const upload = multer({
    limits: {
        fileSize: 2000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|bmp)$/)) {
            cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
});

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({height: 600, width: 600}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();

    res.send();
}, (err, req, res, next) => {
    res.status(400).send({Error: err.message})
});

router.delete('/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
}, (err, req, res, next) => {
    res.status(400).send({Error: err.message})
});

router.get('/user/:id/avatar', async (req, res) => {
    try {
        const {avatar} = await User.findOne({_id: req.params.id});
        if (!avatar) throw new Error('Avatar not found');
        res.set('Content-Type', 'image/png');
        res.send(avatar);
    } catch(e) {
        res.status(404).send();
    }
});

module.exports = router;