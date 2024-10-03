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
        if(query.code !== 200) throw query;

        res.json(query)
        
    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Internal Server Issues"
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
        const msg = error.message ?? "Internal Server issues";
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
        const msg = error.message ?? "Internal Server issues";
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
        const jwt = req.user;
        if(jwt.code !== 200) throw jwt;
        
        const user = new User ({
            id: jwt.user.id,
            email: jwt.user.email
        });
        
        const updateData = {};
        //TODO: Proper email check
        if (req.body.email !== undefined && req.body.email !== '') updateData.email = req.body.email;
        if (req.body.nickname !== undefined && req.body.nickname !== '') updateData.nickname = req.body.nickname;
        if (req.body.first_name !== undefined && req.body.first_name !== '') updateData.first_name = req.body.first_name;
        if (req.body.last_name !== undefined && req.body.last_name !== '') updateData.last_name = req.body.last_name;
        //TODO: Proper password check
        if (req.body.pasta !== undefined && req.body.pasta !== '') updateData.pasta = crypto.createHash('md5').update(req.body.pasta).digest('hex');

        const isEmpty = (obj) => JSON.stringify(obj) === '{}';
        if(isEmpty(updateData)) throw new CustomError(400, "No information was sent");

        const newUser = new User({
            id: user.id,
            email: updateData.email ?? null,
            nickname: updateData.nickname ?? null,
            first_name: updateData.first_name ?? null,
            last_name: updateData.last_name ?? null,
            pasta: updateData.pasta ?? null
        });
        const query = await newUser.update();
        if(query.code !== 200) throw query;
        res.status(200).send( { "code": 200, "message": "User has been updated." } );

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Internal Server issues"
        res.status(code).send( { "code": code, "message": msg} ) ;
    };
});

export default router;