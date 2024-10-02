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
    //Esse construtor provavelmente vai causar problema
    constructor({ id, email, googleid, nickname, first_name, last_name, profile_picture, pasta}) {
        this.id = id,
        this.email = email,
        this.googleid = googleid,
        this.nickname = nickname,
        this.first_name = first_name,
        this.last_name = last_name,
        this.profile_picture = profile_picture,
        this.pasta = pasta;
    };

    async get() {
        let user;
        try {
            user = await Db.find('users', {
                filter: { id: this.id },
                view: ['email', 'nickname', 'first_name', 'last_name', 'profile_picture']
            });
            if (user.length === 0) throw new CustomError(404, `User does not exist`);

        } catch (error) {
            const code = error.code ?? 500;
            const msg = error.message ?? "Failed to retrieve user data."
            return new CustomError(code, msg);
        }

        const obj = new User({
            id: this.id,
            email:`${user[0].email}`,
            nickname: `${user[0].nickname}`,
            first_name: `${user[0].first_name}`,
            last_name: `${user[0].last_name}`,
            profile_picture: `${user[0].profile_picture}`,
        });
        return { "code": 200, "user": obj};
    };

    static async getNameList(name){
        if (!name) throw new CustomError(400, 'Nickname is required');

        const results = [];
        try {
            const exact = await Db.find('users', {
                filter: { nickname: name },
                view: [ 'nickname', 'profile_picture' ],
                opt: { limit: 1 }
            });
            if(exact.length === 1) results.push(exact[0]);

            const prefix = await Db.find('users', {
                filter: { nickname: Db.like( `${name}_%` ) },
                view: [ 'nickname', 'profile_picture' ],
                opt: { limit: 5 }
            });
            if(prefix.length >= 1) {
                prefix.forEach(query => {
                    results.push(query);
                });
            };
            
            const suffix = await Db.find('users', {
                filter: { nickname: Db.like( `%_${name}` ) },
                view: ['nickname', 'profile_picture'],
                opt: { limit: 5 }
            });
            if(suffix.length >= 1) {
                suffix.forEach(query => {
                    results.push(query);
                });
            };

            if(results.length === 0) throw new CustomError(404, "No results found.");
            return { "results": results, "code": 200};

        } catch (error) {
            const code = error.code ?? 500;
            const msg = error.message ?? "Internal Server Issues: GET '/:users'"
            return new CustomError(code, msg);
        }
    };

    async deleteUser(){
        try {
            const find = await Db.find('users', {
                filter: { id: this.id },
                view: [ 'id' ],
                opt: { limit: 1 }
            });
            if(find.length === 0) throw new CustomError(404, "User not found.")
            const query = await Db.delete('users', this.id);
            return { "code": 200 };
            
        } catch (error) {
            const code = error.code ?? 500;
            const msg = error.message ?? "Internal Server Issues: DELETE '/'"
            return new CustomError(code, msg);
        };
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
            return { "code": 200 };

        } catch (error) {
            const code = error.code ?? 500;
            const msg = error.message ?? "Internal Server Issues: User.add()"
            return new CustomError(code, msg);
        };
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
        };
    };

    async updateUserNews(){
        try {
            const activeTime = await utcFix();
            await Db.update('users', { read_news: activeTime }, this.id);
        } catch (error) {
            throw new CustomError(500, "Internal Server Error", error.message);
        };
    };

    async updateActive(){
        try {
            const activeTime = await utcFix();
            await Db.update('users', { active: activeTime }, this.id)
        } catch (error) {
            const code = error.code ?? 500;
            const msg = error.message ?? "Failed to update active";
            return new CustomError(code, msg);
        };
    };

    static async fetchData(filter, value){
        if(filter === "email" && typeof(value) === "string"){
            try {
                const id = await Db.find('users', { filter: { email: value }, view: [ 'id' ], opt: { limit: 1 } });
                if(id.length === 0) throw { "code": 404, "message": "User not Found" };
                return { "code": 200, "id": id[0].id };

            } catch (error) {
                const code = error.code ?? 500;
                const msg = error.message ?? "Internal Auth Issues";
                return new CustomError(code, msg);
            };

        } else if(filter === "id"){
            try {
                const email = await Db.find('users', { filter:  { id: value }, view: [ 'email' ], opt: { limit: 1 } });
                if(email.length === 0) throw { "code": 404, "message": "User not Found" };
                return { "code": 200, "email": email[0].email };

            } catch (error) {
                const code = error.code ?? 500;
                const msg = error.message ?? "Internal Auth Issues";
                return new CustomError(code, msg);
            };
        };
    };
};

async function utcFix() {
    const now = Date.now();
    const utcfix = now - (3 * 60 * 60 * 1000); 
    return Db.toDateTime(utcfix); 
};

