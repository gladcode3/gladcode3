import express from 'express'
import News from '../model/news.js'
import User from '../model/users.js';
import CustomError from '../core/error.js';
import Auth from '../middleware/auth.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        if(req.query.limit > 20) throw { "code": 400, "message": "Limit is too high." };
        
        const query = await News.get(req.query.page, req.query.limit);
        if(!query) res.send( { "code": 404, "message":`No posts were found.` } );
        res.status(200).send(query); //Retorna em JSON

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Failed to retrieve news";
        res.status(code).send( { "code": code, "message": msg } );
    }
});

router.get('/:hash', async (req, res) => {
    try {
        req.optional = true;
        const auth = await Auth.check(req, res);
        if(auth.code === 500) throw auth;

        const query = await News.getByHash(req.params.hash);
        if(query.code !== 200) throw query;
        
        if(auth.code === 200){
            console.log(auth)
            const user = new User({
                id: auth.user.id,
                email: auth.user.email
            });
            const updateQuery = await user.updateReadNews();
            if(updateQuery.code !== 200) throw updateQuery;
        }  
        res.status(200).send(query);

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Failed to retrieve news";
        res.status(code).send( { "code": code, "message": msg } );
    };
});

export default router