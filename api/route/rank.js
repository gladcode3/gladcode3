import express from 'express'
import Rank from '../model/rank.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try{
        const query = await Rank.getRank(req.query.page, req.query.search, req.query.limit);
        res.json(query);

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Failed to retrieve news";
        res.status(code).send( { "message": msg } );
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
        const code = error.code ?? 500;
        const msg = error.message ?? "Failed to retrieve news";
        res.status(code).send( { "message": msg } );
    }
});



export default router
