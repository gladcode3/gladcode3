import { OAuth2Client } from 'google-auth-library';
import CustomError from '../core/error.js';
import User from '../model/users.js';
import Db from '../core/mysql.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export default class Auth {

    static async login(req, res, next) {
        try {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const client = new OAuth2Client();
            const token = Auth.retrieveToken(req.headers['authorization']);
            
            if(!token) return new CustomError(401, "Empty token header")

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
                    throw new CustomError(code, msg);
                };
            };

            const googleData = await getGooglePayload();
            if (googleData.sub) {
                const { email, given_name: first_name, family_name: last_name, sub: googleid } = googleData;
                const query = await Auth.lookForUser(email, first_name, last_name, googleid);
                if(query.code !== 200) throw query;
    
                const userPayload = await Auth.getPayload(email);
                const token = jwt.sign(userPayload, process.env.SIGN_TOKEN);
                return {
                    "token": token,
                    "code": 200
                };

            } else {
                return new CustomError(401, 'Invalid Google token');
            };
        } catch (error) {
            const code = error.code ?? 500;
            const msg = error.message ?? "Internal Authenticaion Issues";
            return new CustomError(code, msg);
        };
    };

    static async check(req, res, next) {
        try {
            const token = Auth.retrieveToken(req.headers['authorization']);

            const isOptional = req.optional ?? false;
            if(!token && isOptional) return { "code": 202, "message": "User has access but not logged in." };
            if (!token) throw new CustomError(400, 'Token is null');

            const clientId = process.env.GOOGLE_CLIENT_ID;
            const client = new OAuth2Client();

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
                    throw new CustomError(code, msg);
                };
            ;}
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

                    req.user = { "user": obj, "code":200 };
                    next();
                    
                };
        
        } catch (error) {
            const code = error.code ?? 500;
            const msg = error.message ?? "Server issues when verifying user";
            const customError = new CustomError(code, msg);
            req.user = customError;
            next();
        }
    }

    /*
    //Checks platform's JWT

    static async check(req, res, next) {
        try{
            const token = Auth.retrieveToken(req.headers['authorization']);

            const isOptional = req.optional ?? false;
            if(!token && isOptional) return { "code": 202, "message": "User has access but not logged in." };
            if (!token) throw new CustomError(400, 'Token is null');

            const decoded = jwt.verify(token, process.env.SIGN_TOKEN)
            const fetch = await User.fetchData("id", decoded.id); //Queries for the email, so it can be used on the constructor.
            if(fetch.code !== 200) throw fetch;
            const obj = new User({
                id: decoded.id,
                email: fetch.email
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

                const userProfile = new User({
                    email: email,
                    googleid: googleid,
                    nickname:`${first_name}${Math.floor(Math.random() * 900) + 100}`,
                    first_name: first_name,
                    last_name: last_name,
                    profile_picture: `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')}?d=retro`,
                    pasta: crypto.createHash('md5').update(email).digest('hex'),
                });
                const query = await userProfile.add();
                if(query.code !== 200) throw query;
                return { "code": 200 };
            }else{
                return { "code": 200 };
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