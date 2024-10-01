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
                    throw new CustomError(code, msg, error.message);
                }
            }

            const googleData = await getGooglePayload();
            if (googleData.sub) {
                const { email, given_name: firstName, family_name: lastName, sub: googleid } = googleData;
                await Auth.lookForUser(email, firstName, lastName, googleid);
    
                const userPayload = await Auth.getPayload(email);
                const token = jwt.sign(userPayload, process.env.SIGN_TOKEN);
                return {
                    token: token,
                    code: 200
                }

            } else {
                return new CustomError(401, 'Invalid Google token');
            }
        } catch (error) {
            const code = error.code ?? 500
            const msg = error.message ?? "Internal Authenticaion Issues"
            return new CustomError(code, msg, error.message);
        }
    }

    //updateActive não deveria ser static
    static async check(req, res, next) {
        try{
            
            const token = Auth.retrieveToken(req.headers['authorization']);
            if (!token) throw new CustomError(401, 'Token is null');

            const decoded = jwt.verify(token, process.env.SIGN_TOKEN)
            const email = await User.fetchData("id", decoded.id);
            const obj = new User({
                id: decoded.id,
                email: email
            });
            await obj.updateActive();
            req.user = {"user": obj, "code": 200};
            next();

        }catch(error){
            const code = error.code ?? 500
            const msg = error.message ?? "Server issues when verifying user"
            return {"code": code, "message": msg};
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
                await userProfile.add();
            }
        } catch (error) {
            next(error)
        }
    }

    static async getPayload(email){
        const payloadQuery = await Db.find('users', {
            filter: { email: `${email}`},
            view: ['id', 'nickname'],
            opt: { limit: 1}
        });
        return {
            id: payloadQuery[0].id
        }
    }

    static retrieveToken(authHeader){
        return authHeader && authHeader.split(' ')[1];
    }
}