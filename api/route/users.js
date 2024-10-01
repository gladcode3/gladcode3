import express from 'express'
import User from '../model/users.js';
import CustomError from '../core/error.js';
import Auth from '../middleware/auth.js'
const router = express.Router();


router.get('/', Auth.check, async (req, res, next) => {
    try {
        const jwt = req.user;
        if(jwt.code !== 200) throw new CustomError(jwt.code, jwt.message);
        const user = await User.get(jwt.user.id);
        res.json(user)
        
    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Internal Login issues"
        res.status(code).send({ "code": code, "message": msg});
    }  
})

//Atualiza usuários
//Por algum motivo a função precisa de um email, mesmo se estiver vazio
//Isso é devido ao construtor. O problema realmente era mais na falta de padronização, com padronização o email sempre é construído junto.
router.put('/', Auth.check, async (req, res, next) => {
    try {
        if (!req.user) throw new CustomError(401, "Missing JWT");
        const jwt = req.user;

        const updateData = {};
        if (req.body.email !== undefined && req.body.email !== null) updateData.email = req.body.email;
        if (req.body.nickname !== undefined && req.body.nickname !== null) updateData.nickname = req.body.nickname;
        if (req.body.firstName !== undefined && req.body.firstName !== null) updateData.firstName = req.body.firstName;
        if (req.body.lastName !== undefined && req.body.lastName !== null) updateData.lastName = req.body.lastName;

        await new User({
            id: jwt.id,
            email: updateData.email,
            nickname: updateData.nickname,
            firstName: updateData.firstName,
            lastName: updateData.lastName,
        }).update();
        res.send('User has been updated');

    } catch (error) {
        throw new CustomError(500, "Internal server error", error.message);
    }
});

router.delete('/', Auth.check, async (req, res, next) => {
    try {
        const jwt = req.user;
        const user = new User({ id: jwt.id, email: jwt.email })
        user.deleteUser();
        res.send(`User ${jwt.id} has been deleted`)

    } catch (error) {
        throw new CustomError(500, "Internal server error", error.message);
    }
})

// Busca por usuários
router.get('/:name', async (req, res, next) => {
    try {
        const users = await new User({
            name: req.params.name,
        }).getNameList();

        if (!users || users.length === 0) {
            throw new CustomError(404, 'User not found');
        }
        res.send({
            users,
            message: 'User found!',
        });
    }
    catch (error) {
        throw new CustomError(500, "Internal server error", error.message);
    }  
})

router.post('/login', async (req, res, next) => {
    try {
        const login = await Auth.login(req, res, next);
        const httpCode = login.code ?? 200 
        if(httpCode !== 200) throw login;
        res.send(login);

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Internal Login issues"
        res.status(code).send({ "code": code, "message": msg});
    }
})

export default router;