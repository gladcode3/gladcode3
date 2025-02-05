import express from 'express'
import Auth from '../middleware/auth.js';
import Report from '../model/report.js';
import CustomError from '../core/error.js';
const router = express.Router();

router.get('/get', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(check.user){
            const query = await Report.get(req.query.page, req.query.favorites, req.query.unread_only, check.user, req.query.read);
            res.json(query);
        }
        throw new CustomError(401, "User has not logged in.");

    } catch (error) {
        next(error);
    }
});

router.get('/favorite', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;

        if(check.user){
            const query = await Report.favorite(req.query.favorite, req.query.id, req.query.comment);
            res.json(query);
        }
        throw new CustomError(401, "User has not logged in.");

    } catch (error) {
        next(error);
    }
});

router.delete('/delete', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;

        if(check.user){
            const query = await Report.favorite(req.query.favorite, req.query.id, req.query.comment);
            res.json(query);
        }
        throw new CustomError(401, "User has not logged in.");

    } catch (error) {
        next(error);
    }
})