import express from 'express';
import Auth from '../middleware/auth.js';

import Friends from '../model/friends.js';
import CustomError from '../core/error.js';

const router = express.Router();

router.get('/get', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw new CustomError(401, "User has not logged in.");

        const friends = await Friends.getAll(check.user);
        res.status(200).json(friends);
        
    } catch (error) {
        next(error);
    }
});

router.put('/request/:id', async (req, res, next) => {
    try {
        if (!req.params.id) throw new CustomError(400, "Friend request ID is required");
        if (!req.body.answer) throw new CustomError(400, "Answer is required");

        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw new CustomError(401, "User has not logged in.");
                
        const answer = req.body.answer.toUpperCase();
        if (answer !== 'YES' && answer !== 'NO') 
            throw new CustomError(400, "Answer must be YES or NO");

        const result = await Friends.handleRequest(req.params.id, check.user, answer);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw new CustomError(401, "User has not logged in.");

        if (!req.params.id) throw new CustomError(400, "Friend ID is required");
        
        await Friends.delete(req.params.id, check.user.id);
        res.status(200).json({ code: 200, message: "OK" });
    } catch (error) {
        next(error);
    }
});

router.post('/add', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw new CustomError(401, "User has not logged in.");

        if (!req.body.user) throw new CustomError(400, "User ID is required");
        
        const result = await Friends.add(check.user.id, req.body.user);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw new CustomError(401, "User has not logged in.");

        if (!req.query.text) throw new CustomError(400, "Filter text is required");
        
        const friends = await Friends.search(check.user.id, req.query.text);
        res.status(200).json(friends);
    } catch (error) {
        next(error);
    }
});

export default router;