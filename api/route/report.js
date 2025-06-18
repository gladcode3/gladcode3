import express from 'express'
import Auth from '../middleware/auth.js';
import Report from '../model/report.js';
import CustomError from '../core/error.js';
const router = express.Router();

router.get('/get', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check  = req.check;

        if(!check.user){ throw new CustomError(401, check.message); }
            
        const query = await Report.get(
            req.query.page, 
            req.query.favorites, 
            req.query.is_read, 
            check.user,
            req.query.limit, 
            req.query.type
        );
        res.json(query);

    } catch (error) {
        next(error);
    }
});

router.put('/readall', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;

        if(!check.user){  throw new CustomError(401, check.message); }
        const user = check.user;
            
        const query = await Report.readAll(user);
        res.status(200).json(query);

    } catch (error) {
        next(error);
    }
});

router.put('/favorite', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;

        if(check.user){
            const query = await Report.favorite(req.body.id, req.body.comment, check.user);
            res.status(200).json(query);

        } else { 
            throw new CustomError(401, "User has not logged in."); 
        }

    } catch (error) {
        next(error);
    }
});

router.delete('/delete', async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;

        if(check.user){
            const query = await Report.delete(req.body.id, check.user);
            res.json(query);
        }
        throw new CustomError(401, "User has not logged in.");

    } catch (error) {
        next(error);
    }
})

export default router;