import express from 'express';
import Auth from '../middleware/auth.js';
import Friends from '../model/friends.js';
import CustomError from '../core/error.js';

const router = express.Router();

router.get('/', Auth.check, async (req, res, next) => {
    try {
        const friends = await Friends.getAll(req.user.id);
        res.status(200).json(friends);
    } catch (error) {
        next(error);
    }
});

router.put('/request/:id', Auth.check, async (req, res, next) => {
    try {
        if (!req.params.id) throw new CustomError(400, "Friend request ID is required");
        if (!req.body.answer) throw new CustomError(400, "Answer is required");
        
        const answer = req.body.answer.toUpperCase();
        if (answer !== 'YES' && answer !== 'NO') 
            throw new CustomError(400, "Answer must be YES or NO");

        const result = await Friends.handleRequest(req.params.id, req.user.id, answer);
        res.status(200).json({ code: 200, message: "OK" });
    } catch (error) {
        next(error);
    }
});

router.get('/search', Auth.check, async (req, res, next) => {
    try {
        if (!req.query.text) throw new CustomError(400, "Search text is required");
        
        const users = await Friends.searchUsers(req.query.text, req.user.id);
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', Auth.check, async (req, res, next) => {
    try {
        if (!req.params.id) throw new CustomError(400, "Friend ID is required");
        
        await Friends.delete(req.params.id, req.user.id);
        res.status(200).json({ code: 200, message: "OK" });
    } catch (error) {
        next(error);
    }
});

router.post('/', Auth.check, async (req, res, next) => {
    try {
        if (!req.body.user) throw new CustomError(400, "User ID is required");
        
        const result = await Friends.add(req.user.id, req.body.user);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/filter', Auth.check, async (req, res, next) => {
    try {
        if (!req.query.text) throw new CustomError(400, "Filter text is required");
        
        const friends = await Friends.filter(req.user.id, req.query.text);
        res.status(200).json(friends);
    } catch (error) {
        next(error);
    }
});

export default router;