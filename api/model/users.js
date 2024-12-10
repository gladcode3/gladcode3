import CustomError from "../core/error.js";
import db from "../core/mysql.js";
export default class User {
  constructor({
    id,
    email,
    googleid,
    firstName,
    lastName,
    nickname,
    profilePicture,
  }) {
    this.id = id;
    this.email = email;
    this.googleid = googleid;
    this.nickname = nickname;
    this.firstName = firstName;
    this.lastName = lastName;
    this.profilePicture = profilePicture || null;
  }

  async delete() {
    db.delete("users", this.id);
  }

  async add() {
    try {
      const sql = await db.insert("users", {
        email: `${this.email}`,
        googleid: `${this.googleid}`,
        nickname: `${this.nickname}`,
        firstName: `${this.firstName}`,
        lastName: `${this.lastName}`,
        profilePicture: `${this.profilePicture}`,
        active: `${db.toDateTime(Date.now())}`,
      });

      this.id = sql[0].insertId;
      return this.get();
    } catch (error) {
      throw new CustomError(
        error.code ?? 500,
        error.message ?? "Internal server error"
      );
    }
  }

  async getByNickname(nickname) {
    if (!nickname) throw new CustomError(400, "Nickname is required");
    try {
      const users = await db.find("users", {
        filter: { nickname },
        opt: { limit: 20 },
      });

      return users;
    } catch (error) {
      throw new CustomError(
        error.code ?? 500,
        error.message ?? "Internal server error"
      );
    }
  }

  async getById(id) {
    if (!id) throw new CustomError(400, "Id is required");

    try {
      const users = await db.find("users", {
        filter: { id },
      });

      return users;
    } catch (error) {
      throw new CustomError(
        error.code ?? 500,
        error.message ?? "Internal server error"
      );
    }
  }

  async update() {
    try {
      if (this.nickname !== undefined && this.nickname !== null) {
        console.log(`Updating nickname: ${this.nickname}`);
        db.update("users", { nickname: this.nickname }, this.id);
      }

      if (this.firstName !== undefined && this.firstName !== null) {
        console.log(`Updating firstName: ${this.firstName}`);
        db.update("users", { firstName: this.firstName }, this.id);
      }

      if (this.lastName !== undefined && this.lastName !== null) {
        console.log(`Updating lastName: ${this.lastName}`);
        db.update("users", { lastName: this.lastName }, this.id);
      }

      if (this.email !== undefined && this.email !== null) {
        console.log(`Updating email: ${this.email}`);
        db.update("users", { email: this.email }, this.id);
      }
      return this.get();
    } catch (error) {
      console.error(`Error in update: ${error.message}`);
      throw new CustomError(500, "Internal server error");
    }
  }

  // TODO - Add pagination
  async getNameList() {
    try {
      const users = await db.find("users", {
        opt: {
          order: {
            active: -1,
          },
          limit: 20,
        },
      });

      return users;
    } catch (error) {
      throw new CustomError(
        error.code ?? 500,
        error.message ?? "Internal server error"
      );
    }
  }
}
