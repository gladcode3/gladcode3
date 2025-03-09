import express from 'express'
import Auth from '../middleware/auth.js';
import Friends from '../model/friends.js';

const router = express.Router();

router.get('/get', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check

        const query = await Friends.get(check.user.id);
        res.status(query.code).json(query)

    } catch (error) {
        next(error);
    }
})

router.put('/request', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;

        const query = await Friends.request(req.body.id, req.body.answer);
        res.status(200).send(query);
        
    } catch (error) {
        next(error);
    }

router.get('/filter', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;

        const query = await Friends.filter(req.params.search, check.user.id);
        res.status(200).send(query);
        
    } catch (error) {
        next(error);
    }
});

});