import express from 'express'
import News from '../model/news.js'
import User from '../model/users.js';
import CustomError from '../core/error.js';
import Auth from '../middleware/auth.js';
const router = express.Router();

router.get('/', Auth.check, async (req, res) => {
    try {
        const query = await News.getNews();
        if(!query) res.send(`No posts were found.`);
        res.send(query)

    } catch (error) {
        throw new CustomError(500, "Internal server error", error.message)
    }
});

router.get('/:hash', Auth.check, async (req, res) => {
    try {
        const jwt = req.user;
        const query = await News.getNewsById(req.params.hash);
        if(!query) res.send(`No posts found for the given URL: ${req.params.hash}`);
        User.updateUserNews(jwt.id);
        res.send(query);

    } catch (error) {
        throw new CustomError(500, "Internal server error", error.message)
    }  
});

export default router