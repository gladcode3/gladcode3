import express from 'express'
import User from '../model/users.js';
import CustomError from '../core/error.js';
import Auth from '../middleware/auth.js'
const router = express.Router();

// Retorna as próprias informações.
router.get('/', Auth.check, async (req, res, next) => {
    try {
        const jwt = req.user;
        const user = await new User({
            id: jwt.id
        }).get();
        res.json(user);
        
    } catch (error) {
        next(error);
    }  
})

//Atualiza usuários
//Por algum motivo a função precisa de um email, mesmo se estiver vazio
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
        next(error);
    }
});

router.delete('/', Auth.check, async (req, res, next) => {
    try {
        const jwt = req.user;
        await new User({ id: jwt.id }).delete();
        res.send(`User ${jwt.id} has been deleted`)

    } catch (error) {
        next(error);
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
        next(error);
    }  
})

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

router.put('/', Auth.check, async (req, res, next) => {
    try {
        const jwt = req.user;
        if(jwt.code !== 200) throw jwt;

        const updateData = {};
        if (req.body.nickname !== undefined && req.body.nickname !== '') updateData.nickname = req.body.nickname;
        if (req.body.pfp !== undefined && req.body.pfp !== '') updateData.profile_picture = req.body.profile_picture;
        if (req.body.prefLanguage !== undefined && req.body.prefLanguage !== '') {
            const prefLanguage = req.body.prefLanguage;
            if(prefLanguage === 'c' || prefLanguage === 'python' || prefLanguage === 'blocks' ) updateData.pref_language = prefLanguage;
        };

        const isEmpty = (obj) => JSON.stringify(obj) === '{}';
        if(isEmpty(updateData)) throw new CustomError(400, "No data was sent");

        const newUser = new User({
            id: jwt.user.id,
            nickname: updateData.nickname ?? null,
            profile_picture: updateData.pfp ?? null,
            pref_language: updateData.pref_language ?? null
        });
        const query = await newUser.update();
        if(query.code !== 200) throw query;

        res.status(200).send( { "code": 200, "message": "User has been updated." } );

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Internal Server issues"
        res.status(code).send( { "code": code, "message": msg } ) ;
    };
});

export default router;