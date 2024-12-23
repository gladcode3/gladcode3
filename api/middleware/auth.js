import { OAuth2Client } from 'google-auth-library';
import CustomError from '../core/error.js';
import User from '../model/users.js';
import Db from '../core/mysql.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export default class Auth {

    static async login(req) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const client = new OAuth2Client();
        const fetchCerts = await client.getFederatedSignonCertsAsync(); //Hackfix for kid issues

        const token = Auth.retrieveToken(req.headers['authorization']);
        if(!token) throw new CustomError(401, "Empty token header");

        const getGooglePayload = async () => {
            try {
                const googleData = await client.verifyIdToken({
                    idToken: token,
                    audience: clientId,
                });
                return googleData.getPayload();
            }
            catch (error) {
                const code = error.code ?? 500;
                const msg = error.message ?? "Failed to get Google Payload";
                throw new CustomError(code, msg, error.data);
            };
        };
        const googleData = await getGooglePayload();

        if (googleData.sub) {
            const { email, given_name: first_name, family_name: last_name, sub: googleid } = googleData;
            await Auth.lookForUser(email, first_name, last_name, googleid);

            const userPayload = await Auth.getPayload(email);
            const token = jwt.sign(userPayload, process.env.SIGN_TOKEN);
            return { token, "message": "Token has been signed.", "code": 200 };

        } else {
            throw googleData;
        };
    };

    static async check(req) {
        try {
            const token = Auth.retrieveToken(req.headers['authorization']);

            const isOptional = req.optional ?? false;
            if(!token && isOptional) return { "message": "User has access but not logged in." };
            if (!token) throw new CustomError(400, 'Token was not sent');

            const clientId = process.env.GOOGLE_CLIENT_ID;
            const client = new OAuth2Client();
            const fetchCerts = await client.getFederatedSignonCertsAsync(); //Hackfix for kid issues

            const getGooglePayload = async () => {
                try {
                    const googleData = await client.verifyIdToken({
                        idToken: token,
                        audience: clientId,
                    })
                    return googleData.getPayload();
                }
                catch (error) {
                    const code = error.code ?? 500;
                    const msg = error.message ?? "Failed to get Google Payload";
                    throw new CustomError(code, msg);
                };
            }
                const googleData = await getGooglePayload();

                if (googleData.sub) {
                    const { email } = googleData;
                    const fetch = await User.fetchData("email", email);
            
                    if(fetch.code !== 200) throw fetch;
                    const obj = new User({
                        id: fetch.id,
                        email: email
                    });
                    await obj.updateActive();

                    req.check = { "user": obj };
                    return;
                };
        
        } catch (error) {
            const code = error.code ?? 500;
            const msg = error.message ?? "Failed to get Google Payload";
            req.check = new CustomError(code, msg, error.data);
            return;
        }
    }

    /*
    //Checks platform's JWT

    static async check(req, res, next) {
        try{
            const token = Auth.retrieveToken(req.headers['authorization']);
            jwt.verify(token, process.env.SIGN_TOKEN, (err, user) => {
                if (err) throw new CustomError(403, 'Token is invalid');
                req.user = user;
                next();
            });
            await obj.updateActive();
            
            req.user = { "user": obj, "code": 200 };
            next();

        }catch(error){
            const code = error.code ?? 500;
            const msg = error.message ?? "Server issues when verifying user";
            const customError = new CustomError(code, msg);
            req.user = customError;
            next();
        };
    };
    */

    static async lookForUser(email, first_name, last_name, googleid){
        const user = await Db.find('users', {
            filter: { email: `${email}` },
            view: [ 'email' ],
            opt: { limit: 1 }
        });

        if (user.length === 0) {
            
            await new User({
                email: email,
                googleid: googleid,
                nickname:`${first_name}${Math.floor(Math.random() * 900) + 100}`,
                firstName: first_name,
                lastName: last_name,
                profilePicture: `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')}?d=retro`,
                pasta: crypto.createHash('md5').update(email).digest('hex'),
            }).add();
            return;

        }else{
            return;
        }
    };

    static async getPayload(email){
        const payloadQuery = await Db.find('users', {
            filter: { email: `${email}`},
            view: ['id', 'nickname'],
            opt: { limit: 1}
        });
        return {
            id: payloadQuery[0].id
        }
    };


    static retrieveToken(authHeader){
        return authHeader && authHeader.split(' ')[1];
    };
};
