import express from 'express'
import Auth from '../middleware/auth.js';
const router = express.Router();

router.get('/', async (req, res, next) => {
    res.json("Hello from report");
});