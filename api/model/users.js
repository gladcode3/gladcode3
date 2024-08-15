import CustomError from '../core/error.js';
import Db from '../core/mysql.js';
import jwt from 'jsonwebtoken';
import config from '../config.js';
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
            const sql = await Db.insert('users',
            {
                email: `${this.email}`,
                googleid: `${this.googleid}`,
                nickname: `${this.nickname}`,
                firstName: `${this.firstName}`,
                lastName: `${this.lastName}`,
                profilePicture: `${this.profilePicture}`,
                pasta: `${this.pasta}`,
                active: `${Db.toDateTime(Date.now())}`
            });

            return;

        } catch (error) {
            console.log(error);
        }
    }

    async getUserData(){
            const users = await Db.find('users', {
                filter: { id: Db.like(this.id) },
                view: [ 'email', 'nickname', 'firstName', 'lastName', 'profilePicture', 'pasta' ]
            });

            if(users.length === 0) throw new CustomError(404, `User does not exist`);

            const user = await new User({
                id: this.id,
                email: users[0].email,
                nickname: users[0].nickname,
                firstName: users[0].firstName,
                lastName: users[0].lastName,
                profilePicture: users[0].profilePicture,
                pasta: crypto.createHash('md5').update(users[0].email).digest('hex')
            });
            return user;
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
            console.error(`Error in updateUser: ${error.message}`);
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
        return jwt.sign(userPayload, config.signToken);
    }
}