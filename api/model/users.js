import CustomError from '../core/error.js';
import { db } from '../core/mysql.js';
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

            this.id = sql[0].insertId;
            return this.get();

        } catch (error) {
            console.log(error);
        }
    }

    async getByNickname(nickname) {
        if (!nickname) throw new CustomError(400, "Nickname is required");
    
        try {
          const [rows, _] = await db.execute(
            "SELECT * FROM users WHERE nickname = ?",
            [nickname] // The value of name is safely passed as a parameter
          );
    
          if (rows.length === 0)
            throw new CustomError(404, "No users found with the given nickname");
          return rows;
        } catch (error) {
          console.error(`Error in getNameList: ${error.message}`);
          throw new CustomError(500, "Internal server error");
        }
      }
    

    async update() {
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
            return this.get();
        
        } catch (error) {
            console.error(`Error in update: ${error.message}`);
            throw new CustomError(500, "Internal server error");
        }
    }
    
    // TODO - Add pagination
    async getNameList(){
        try {
          const [rows, _] = await db.execute(
            "SELECT * FROM users LIMIT 20",
          );
    
          if (rows.length === 0)
            throw new CustomError(404, "No users were found");
          return rows;
        } catch (error) {
          console.error(`Error in getNameList: ${error.message}`);
          throw new CustomError(500, "Internal server error");
        }
    }
}