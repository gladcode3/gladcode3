import express from 'express'
import Rank from '../model/rank.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.send( { "message": "Hello World! This is the ranking route." } )

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Failed to retrieve news";
        res.status(code).send( { "code": code, "message": msg } );
    }
})

export default router
