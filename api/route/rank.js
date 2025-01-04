import express from 'express'
import Rank from '../model/rank.js';
const router = express.Router();

router.get('/get', async (req, res, next) => {
    try{
        const query = await Rank.get(req.query.page, req.query.qnt, req.query.srch);
        res.json(query);

    } catch (error) {
        next(error);
    }
});

router.get('/watch', async (req, res) => {
    // const query = await Rank.getWatchTab();
    res.status(200).json( { "message": "Hello from /watch" });
});

router.get('/fetch', async (req, res) => {
    try{
        const query = await Rank.rankFetch(req.query.tab, req.query.search);
        res.json(query);

    } catch (error) {
        next(error);    
    }
});

export default router
