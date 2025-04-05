import express from 'express'
import Rank from '../model/rank.js';
import CustomError from '../core/error.js';
import Auth from '../middleware/auth.js';

const router = express.Router();

router.get("/rank", async(req, res, next) => {
    try {
        
        const offset = req.body.offset !== undefined ? parseInt(req.body.offset) : undefined;
        const search = req.body.search || "";

        const query = await ranking.get({ offset, search });
        res.status(200).json(query);

    } catch (error) {
        next(error);
    }
});

router.put("/watch-tab", async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw check;

        const name = req.body.name?.trim();
        if(!name){
            throw new CustomError(400, "Tab name is required.");
        }

        let watch = null;
        if(req.body.add !== undefined){
            watch = true;
        } else if(req.body.remove !== undefined){
            watch = false;
        }

        if(watch === null) throw new CustomError(400, "No action.");

        const query = await Rank.toggleWatchTab(check.user.id, name, watch);
        res.status(200).json(query);

    } catch (error) {
        next(error);
    }
});

router.get("/tabs", async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw check;

        const query = await Rank.getTabs(check.user.id);
        res.status(200).json(query);

    } catch (error) {
        next(error);
    }
});

router.get("/fetch-tab", async (req, res, next) => {
    try {
        const tab = req.body.tab;
        const search = req.body.search?.toLowerCase() || "";

        if(!tab) throw new CustomError(400, "Tab name is required");
        const query = await Rank.fetchTabRanking(tab, search);

    } catch (error) {
        next();
    }
});

router.get("/max-mine", async (req, res, next) => {
    try {
        await Auth.check(req);
        const check = req.check;
        if(!check.user) throw check;

        const result = await Rank.getMaxMineOffset(check.user.id);
        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

export default router;