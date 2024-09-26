import CustomError from '../core/error.js';
import Db from '../core/mysql.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export default class User {

    constructor({ id, email, googleid, firstName, lastName, nickname, profilePicture}) {
        this.id = id,
        this.email = email,
        this.googleid = googleid,
        this.nickname = nickname,
        this.firstName = firstName,
        this.lastName = lastName,
        this.profilePicture = profilePicture || null,
        this.pasta = crypto.createHash('md5').update(email).digest('hex');

    }

    static async deleteUser(id){
        Db.delete('users', id);
    }

    async add(){
        try {
            const activeTime = await utcFix();
            const sql = await Db.insert('users',
            {
                email: `${this.email}`,
                googleid: `${this.googleid}`,
                nickname: `${this.nickname}`,
                firstName: `${this.firstName}`,
                lastName: `${this.lastName}`,
                profilePicture: `${this.profilePicture}`,
                pasta: `${this.pasta}`,
                active: activeTime
            });

            return;

        } catch (error) {
            throw new CustomError(500, "Internal Server Error", error.message);
        }
    }

    static async getUserData(id) {
        const users = await Db.find('users', {
            filter: { id: id },
            view: ['email', 'nickname', 'firstName', 'lastName', 'profilePicture']
        });

        if (users.length === 0) throw new CustomError(404, `User does not exist`);

        return new User({
            id,
            email: users[0].email,
            nickname: users[0].nickname,
            firstName: users[0].firstName,
            lastName: users[0].lastName,
            profilePicture: users[0].profilePicture,
            pasta: crypto.createHash('md5').update(users[0].email).digest('hex')
        });
    }

    async updateUser() {
        try {
            if (this.nickname !== undefined && this.nickname !== null) {
                console.log(`Updating nickname: ${this.nickname}`);
                Db.update('users', { nickname: this.nickname }, this.id);
            }
        
            if (this.firstName !== undefined && this.firstName !== null) {
                console.log(`Updating firstName: ${this.firstName}`);
                Db.update('users', { firstName: this.firstName }, this.id);
            }
        
            if (this.lastName !== undefined && this.lastName !== null) {
                console.log(`Updating lastName: ${this.lastName}`);
                Db.update('users', { lastName: this.lastName }, this.id);
            }
        
            if (this.email !== undefined && this.email !== null) {
                console.log(`Updating email: ${this.email}`);
                Db.update('users', { email: this.email }, this.id);
            }
        
        } catch (error) {
            throw new CustomError(500, "Internal server error");
        }
    }
    
    async getNameList(){
        if (!this.name) throw new CustomError(400, 'Nickname is required');

        const users = await Db.find('users', {
            filter: { name: Db.like(this.nickname) },
            view: ['nickname']
        });
        return users;
    }

    async loginUser(){
        try {
            if(!this.pasta) throw new CustomError(400, 'Password is required');
        
            const idCheck = await Db.find('users', {
                filter: { id: Db.like(this.id) },
                view: ['email'],
                opt: { limit: 1}
            });
            if(idCheck.length === 0) throw new CustomError(404, `User ID not found`);
    
            const pswd = await Db.find('users', {
                filter: { id: `${this.id}`}, 
                view: ['pasta'] 
            });
            if(pswd.length === 0 || this.pasta !== pswd[0].pasta) throw new CustomError(401, `Wrong username or password`);
            
            const userPayload = {
                email: `${idCheck[0].email}`,
                id: `${this.id}`
            }
            return jwt.sign(userPayload, process.env.SIGN_TOKEN);

        } catch (error) {
            throw new CustomError(500, "Internal server error", error.message);
        }

    }
    //Static por enquanto. Depois vai ser por objeto
    static async updateUserNews(id){
        try {
            const activeTime = await utcFix();
            await Db.update('users', { read_news: activeTime }, id)
            await User.updateActive(id)
        } catch (error) {
            throw new CustomError(500, "Internal Server Error", error.message)
        }
    }

    static async updateActive(id){
        try {
            const activeTime = await utcFix();
            await Db.update('users', { active: activeTime }, id)
        } catch (error) {
            throw new CustomError(500, "Internal Server Error", error.message)
        }
    }
}

async function utcFix() {
    const now = Date.now();
    const utcfix = now - (3 * 60 * 60 * 1000); 
    return Db.toDateTime(utcfix); 
}
