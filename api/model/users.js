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
    return db.delete("users", this.id);
  }

  async add() {
    try {
      const sql = await db.insert("users", {
        email: this.email,
        googleid: this.googleid,
        nickname: this.nickname,
        firstName: this.firstName,
        lastName: this.lastName,
        profilePicture: this.profilePicture,
        active: db.toDateTime(Date.now()),
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
        filter: { nickname: { like: nickname } },
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
    if (!id) throw new CustomError(400, "ID is required");

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
        await db.update("users", { nickname: this.nickname }, this.id);
      }

      if (this.firstName !== undefined && this.firstName !== null) {
        console.log(`Updating firstName: ${this.firstName}`);
        await db.update("users", { firstName: this.firstName }, this.id);
      }

      if (this.lastName !== undefined && this.lastName !== null) {
        console.log(`Updating lastName: ${this.lastName}`);
        await db.update("users", { lastName: this.lastName }, this.id);
      }

      if (this.email !== undefined && this.email !== null) {
        console.log(`Updating email: ${this.email}`);
        await db.update("users", { email: this.email }, this.id);
      }
      return this.get();
    } catch (error) {
      console.error(`Error in update: ${error.message}`);
      throw new CustomError(500, "Internal server error");
    }
  }

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

  async get() {
    try {
      const user = await db.find("users", {
        filter: { id: this.id },
        view: ["email", "nickname", "firstName", "lastName", "profilePicture"],
      });

      if (user.length === 0) throw new CustomError(404, "User does not exist");
      return user[0];
    } catch (error) {
      throw new CustomError(
        error.code ?? 500,
        error.message ?? "Internal server error"
      );
    }
  }

  async updateReadNews() {
    const activeTime = await utcFix();
    await db.update("users", { read_news: activeTime }, this.id);
  }

  async updateActive() {
    const activeTime = await utcFix();
    await db.update("users", { active: activeTime }, this.id);
  }

  static async fetchData(filter, value) {
    if (filter === "email" && typeof value === "string") {
      try {
        const id = await db.find("users", {
          filter: { email: value },
          view: ["id"],
          opt: { limit: 1 },
        });

        if (id.length === 0)
          throw new CustomError(404, "User not Found");

        return { code: 200, id: id[0].id };
      } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Internal Auth Issues";
        throw new CustomError(code, msg);
      }
    } else if (filter === "id") {
      try {
        const email = await db.find("users", {
          filter: { id: value },
          view: ["email"],
          opt: { limit: 1 },
        });

        if (email.length === 0)
          throw new CustomError(404, "User not Found");

        return { code: 200, email: email[0].email };
      } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Internal Server Issues";
        throw new CustomError(code, msg);
      }
    }
  }
}

async function utcFix() {
  const now = Date.now();
  const utcfix = now - 3 * 60 * 60 * 1000;
  return db.toDateTime(utcfix);
}
