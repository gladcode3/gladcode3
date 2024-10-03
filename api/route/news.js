import express from 'express'
import News from '../model/news.js'
import User from '../model/users.js';
import CustomError from '../core/error.js';
import Auth from '../middleware/auth.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const query = await News.get();
        if(!query) res.send( { "code": 404, "message":`No posts were found.` } );
        res.status(200).send(query); //Retorna em JSON

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Failed to retrieve news";
        res.status(code).send( { "code": code, "message": msg } );
    }
});

router.get('/:hash', Auth.check, async (req, res) => {
    try {
        const jwt = req.user;

        const query = await News.getByHash(req.params.hash);
        if(!query) res.status(404).json( { message: `No posts found for the given URL: ${req.params.hash}` } );
        if(query !== 200) throw query;

        const user = new User({
            id: jwt.user.id,
            email: jwt.user.email
        })
        const updateQuery = await user.updateReadNews();
        if(updateQuery.code !== 200) throw updateQuery;
        res.status(200).send(query);

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Failed to retrieve news";
        res.status(code).send( { "code": code, "message": msg } );
    };
});

export default router