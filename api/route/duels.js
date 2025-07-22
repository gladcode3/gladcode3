import express from 'express';
import Auth from '../middleware/auth.js';

import Duels from '../model/duels.js';
import CustomError from '../core/error.js';

const router = express.Router();

router.get('/get', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw new CustomError(401, "User has not logged in.");

        const duels = await Duels.get(check.user);
        res.status(200).json(duels);

    } catch (error) {
        next(error);
    }
});

router.get('/report', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw new CustomError(401, "User has not logged in.");

        const report = await Duels.report(check.user, req.params.offset);
        res.status(200).json(report);

    } catch (error) {
        next(error);
    }
});

router.post('/challenge', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw new CustomError(401, "User has not logged in.");

        const challenge = await Duels.challenge(check.user, req.body.friend, req.body.glad);
        res.status(200).json(challenge);

    } catch (error) {
        next(error);
    }
});

router.delete('/delete', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw new CustomError(401, "User has not logged in.");

        const query = await Duels.delete(check.user, req.body.id);
        res.status(200).json(query);

    } catch (error) {
        next(error);
    }
});

export default router;