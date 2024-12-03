import { OAuth2Client } from 'google-auth-library';
import CustomError from '../core/error.js';
import User from '../model/users.js';
import Db from '../core/mysql.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export default class Auth {

    static async login(req, res) {
        try {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const client = new OAuth2Client();
            const token = Auth.retrieveToken(req.headers['authorization']);
            
            const getGooglePayload = async () => {
                try {
                    const googleData = await client.verifyIdToken({
                        idToken: token,
                        audience: clientId,
                    });
                    return googleData.getPayload();
                }
                catch (error) {
                    throw new CustomError(401, 'Invalid token.', error.message);
                }
            }

            const googleData = await getGooglePayload();
            if (googleData.sub) {
                const { email, given_name: firstName, family_name: lastName, sub: googleid } = googleData;
                await Auth.lookForUser(email, firstName, lastName, googleid);
    
                const userPayload = await Auth.createPayload(email);
                const token = jwt.sign(userPayload, process.env.SIGN_TOKEN);
                res.json({ token });

            } else {
                throw new CustomError(401, 'Invalid Google token');
            }
        } catch (error) {
            throw new CustomError(500, "Internal Server Error", error.message);
        }
    }

    static async check(req, res, next) {
        try{
            const token = Auth.retrieveToken(req.headers['authorization']);
            if (!token) throw new CustomError(401, 'Token is null');

            jwt.verify(token, process.env.SIGN_TOKEN, (err, user) => {
                if (err) throw new CustomError(403, 'Token is invalid');
                req.user = user;
                next();
            });

        }catch(error){
            next(error);
        }
    }

    static async lookForUser(email, firstName, lastName, googleid){
        try {
            const user = await Db.find('users', {
                filter: { email: `${email}` },
                view: [ 'email' ],
                opt: { limit: 1 }
            });

            if (user.length === 0) {
                const userProfile = new User({
                    email: email,
                    googleid: googleid,
                    firstName: firstName,
                    lastName: lastName,
                    nickname:`${firstName}${Math.floor(Math.random() * 900) + 100}`,
                    profilePicture: `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')}?d=retro`,
                    active: Date.now()
                });
                console.log(userProfile.active)
                await userProfile.add();
            }
        } catch (error) {
            next(error)
        }
    }

    static async createPayload(email){
        const payloadQuery = await Db.find('users', {
            filter: { email: `${email}`},
            view: ['id'],
            opt: { limit: 1}
        });
        return {
            email,
            id: payloadQuery[0].id
        }
    }

    static retrieveToken(authHeader){
        return authHeader && authHeader.split(' ')[1];
    }
}
