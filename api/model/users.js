import CustomError from '../core/error.js';
import Db from '../core/mysql.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { type } from 'os';

export default class User {

    // id, email, googleid, nickname, first_name, last_name, profile_picture, spoken_language, emoji
    // pasta, lvl, xp, silver, credits, active, premium, show_tutorial, editor_theme, editor_font
    // pref_message, pref_friend, pref_update, pref_duel, pref_tourn, email_update, read_news
    // pref_language, apothecary

    //Snake casing para atributos associados com o MySQL

    constructor({ id, email, googleid, nickname, first_name, last_name, profile_picture}) {
        this.id = id,
        this.email = email,
        this.googleid = googleid,
        this.nickname = nickname || `${first_name}${Math.floor(Math.random() * 900) + 100}`,
        this.first_name = first_name,
        this.last_name = last_name,
        this.profile_picture = profile_picture || `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')}?d=retro`,
        this.pasta = crypto.createHash('md5').update(email).digest('hex');
    };

    async deleteUser(){
        await Db.delete('users', this.id);
    };

    async add(){
        try {
            const activeTime = await utcFix();
            await Db.insert('users',
            {
                email: `${this.email}`,
                googleid: `${this.googleid}`,
                nickname: `${this.nickname}`,
                first_name: `${this.first_name}`,
                last_name: `${this.last_name}`,
                profile_picture: `${this.profile_picture}`,
                pasta: `${this.pasta}`,
                active: `${activeTime}`
            });
            return;

        } catch (error) {
            throw new CustomError(500, "Internal Server Error", error.message);
        };
    };

    static async get(id) {
        const users = await Db.find('users', {
            filter: { id: id },
            view: ['email', 'nickname', 'first_name', 'last_name', 'profile_picture']
        });

        if (users.length === 0) throw new CustomError(404, `User does not exist`);

        return new User({
            id: id,
            email:`${users[0].email}`,
            nickname: `${users[0].nickname}`,
            firstName: `${users[0].firstName}`,
            lastName: `${users[0].lastName}`,
            profilePicture: `${users[0].profilePicture}`,
        });
    };

    async updateUser() {
        try {
            if (this.nickname !== undefined && this.nickname !== null) {
                Db.update('users', { nickname: this.nickname }, this.id);
            };
        
            if (this.first_name !== undefined && this.first_name !== null) {
                Db.update('users', { first_name: this.first_name }, this.id);
            };
        
            if (this.last_name !== undefined && this.last_name !== null) {
                Db.update('users', { last_name: this.last_name }, this.id);
            };
        
            if (this.email !== undefined && this.email !== null) {
                Db.update('users', { email: this.email }, this.id);
            };
        
        } catch (error) {
            throw new CustomError(500, "Internal server error");
        };
    };
    
    async getNameList(){
        if (!this.name) throw new CustomError(400, 'Nickname is required');

        const users = await Db.find('users', {
            filter: { name: Db.like(this.nickname) },
            view: ['nickname']
        });
        return users;
    };

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
                id: `${this.id}`
            }
            return jwt.sign(userPayload, process.env.SIGN_TOKEN);

        } catch (error) {
            throw new CustomError(500, "Internal server error", error.message);
        }

    }

    async updateUserNews(){
        try {
            const activeTime = await utcFix();
            await Db.update('users', { read_news: activeTime }, this.id)
        } catch (error) {
            throw new CustomError(500, "Internal Server Error", error.message)
        }
    }

    async updateActive(){
        try {
            const activeTime = await utcFix();
            await Db.update('users', { active: activeTime }, this.id)
        } catch (error) {
            throw new CustomError(500, "Internal Server Error", error.message)
        }
    }

    static async fetchData(filter, value){
        if(filter === "email" && typeof(value) === "string"){
            try {
                const id = await Db.find('users', { filter: { email: value }, view: [ 'id' ], opt: { limit: 1 } });
                return id[0].id;

            } catch (error) {
                throw new CustomError(500, "Internal Server Error", error.message);
            };

        } else if(filter === "id"){
            try {
                const email = await Db.find('users', { filter:  { id: value }, view: [ 'email' ], opt: { limit: 1 } });
                return email[0].email;

            } catch (error) {
                throw new CustomError(500, "Internal Server Error", error.message);
            };
        };
    };
}

async function utcFix() {
    const now = Date.now();
    const utcfix = now - (3 * 60 * 60 * 1000); 
    return Db.toDateTime(utcfix); 
}

