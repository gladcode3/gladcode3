import express from 'express'
import db from '../core/mysql.js'
const router = express.Router();

router
.route('/')
.get(async (req, res) => {
    try {
        res.send({ message: 'Hello World! '})
    } catch (error) {
        console.log(error)
    }
});

router
.route('/:hash')
.get(async (req, res) => {
    try {
        res.send({ message: 'Hello World!'})
    } catch (error) {
        console.log(error)
    }  
})

export default router