import express from 'express'
import User from '../model/users.js';
import CustomError from '../core/error.js';
import Auth from '../middleware/auth.js'
const router = express.Router();

// Retorna as próprias informações.
router.get('/', Auth.check, async (req, res, next) => {
    try {
        const jwt = req.user; // Ex.: { "code": 200, "user": (...) ?? "message": "Ok"}
        if(jwt.code !== 200) throw jwt;
        
        const user = new User ({
            id: jwt.user.id,
            email: jwt.user.email
        });
        const query = await user.get();
        if(jwt.code !== 200) throw user;
        res.json(query)
        
    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Internal Server Issues: GET '/'"
        res.status(code).send( { "code": code, "message": msg} );
    }  
});

// Busca por usuários
router.get('/:name', async (req, res, next) => {
    try {
        const query = await User.getNameList(req.params.name);
        if(query.code !== 200) throw query;
        res.json(query.results);
    }
    catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Internal Server issues: Delete '/'";
        res.status(code).send( { "code": code, "message": msg } );
    }  
});

//Deleta o user
router.delete('/', Auth.check, async (req, res, next) => {
    try {
        const jwt = req.user;
        if(jwt.code !== 200) throw jwt;

        const query = await jwt.user.deleteUser();
        if(query.code !== 200) throw query;
        
        res.send(`User ${jwt.user.id} has been deleted`)

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Internal Server issues: Delete '/'";
        res.status(code).send( { "code": code, "message": msg } );
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const login = await Auth.login(req, res, next);
        if(login.code !== 200) throw login;
        res.send(login);

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Internal Login issues"
        res.status(code).send({ "code": code, "message": msg});
    }
});

//Atualiza usuários
//Por algum motivo a função precisa de um email, mesmo se estiver vazio
//Isso é devido ao construtor. O problema realmente era mais na falta de padronização, com padronização o email sempre é construído junto.

//TODO Próximo Commit
router.put('/', Auth.check, async (req, res, next) => {
    try {
        if (!req.user) throw new CustomError(401, "Missing JWT");
        const jwt = req.user;
        const user = jwt.user;
        
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

export default router;