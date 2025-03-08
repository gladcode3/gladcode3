import express from 'express'
import Auth from '../middleware/auth.js';
import Friends from '../model/friends.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check

        const query = await Friends.get(check.user.id);
        res.status(query.code).json(query)

    } catch (error) {
        next(error);
    }
})