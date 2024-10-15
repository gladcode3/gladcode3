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

        const user = new User ({
            id: jwt.user.id,
            email: jwt.user.email
        });
        const query = await user.delete();
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