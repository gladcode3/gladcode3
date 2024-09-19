import CustomError from '../core/error.js';
import Db from '../core/mysql.js';

export default class User {

    constructor({ id, email, googleid, firstName, lastName, nickname, profilePicture}) {
        this.id = id;
        this.email = email;
        this.googleid = googleid;
        this.nickname = nickname;
        this.firstName = firstName;
        this.lastName = lastName;
        this.profilePicture = profilePicture || null;
    }

    async delete(){
        Db.delete('users', this.id);
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
                view: [ 'email', 'nickname', 'firstName', 'lastName', 'profilePicture' ]
            });

            if(users.length === 0) throw new CustomError(404, `User does not exist`);

            const user = new User({
                id: this.id,
                email: users[0].email,
                nickname: users[0].nickname,
                firstName: users[0].firstName,
                lastName: users[0].lastName,
                profilePicture: users[0].profilePicture,
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
}