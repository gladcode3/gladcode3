import express from 'express'
import News from '../model/news.js'
import User from '../model/users.js';
import Auth from '../middleware/auth.js';
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        if(req.query.limit > 20) throw { "code": 400, "message": "Limit is too high." };

        const query = await News.get(req.query.page, req.query.limit);
        if(query.code != 200) throw query;
        res.status(200).send(query); //Retorna em JSON

    } catch (error) {
        next(error);
    }
});

router.get('/:hash', async (req, res, next) => {
    try {
        req.optional = true;
        await Auth.check(req);
        const check = req.check;

        const query = await News.getByHash(req.params.hash);
        if(check.user){
            await check.user.updateReadNews();
        }  
        res.status(200).json(query);

    } catch (error) {
        next(error);
    };
});

export default router