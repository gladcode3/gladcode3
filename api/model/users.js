import CustomError from "../core/error.js";
import Db from "../core/mysql.js";

    // id, email, googleid, nickname, first_name, last_name, profile_picture, spoken_language, emoji
    // pasta, lvl, xp, silver, credits, active, premium, show_tutorial, editor_theme, editor_font
    // pref_message, pref_friend, pref_update, pref_duel, pref_tourn, email_update, read_news
    // pref_language, apothecary
    // Esse são os nomes das colunas no próprio BD

export default class User {
  constructor({
    id,
    email,
    googleid,
    firstName,
    lastName,
    nickname,
    profilePicture,
    prefLanguage,
    pasta,
  }) {
    this.id = id;
    this.email = email;
    this.googleid = googleid;
    this.nickname = nickname;
    this.firstName = firstName;
    this.lastName = lastName;
    this.profilePicture = profilePicture;
    this.prefLanguage = prefLanguage;
    this.pasta = pasta;
  }

  async delete() {
    return Db.delete("users", this.id);
  }

  async add() {
    try {
      console.log(this)
      const sql = await Db.insert("users", {
        email: this.email,
        googleid: this.googleid,
        nickname: this.nickname,
        first_name: this.firstName,
        last_name: this.lastName,
        profile_picture: this.profilePicture,
        active: await utcFix(),
        pasta: this.pasta,
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

  //TODO - Não devolver senha nesses gets
  static async getByNickname(nickname) {
    if (!nickname) throw new CustomError(400, "Nickname is required");
    try {
      const users = await Db.find("users", {
        filter: { nickname: { like: nickname } },
        view: ['id', 'email', 'nickname', 'profile_picture', 'lvl', 'active'],
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

  static async getById(id) {
    if (!id) throw new CustomError(400, "ID is required");

    try {
      const users = await Db.find("users", {
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
      console.log(this);
      if (this.nickname !== undefined) await Db.update('users', { nickname: this.nickname }, this.id);
      if (this.profilePicture !== undefined) await Db.update('users', { profile_picture: this.profilePicture }, this.id);
      if (this.prefLanguage !== undefined) await Db.update('users', { pref_language: this.prefLanguage }, this.id);
      return this.get();

    } catch (error) {
      console.error(`Error in update: ${error.message}`);
      throw new CustomError(500, "Internal server error");
    }
  }

  static async getNameList() {
    try {
      const users = await Db.find("users", {
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
      const user = await Db.find("users", {
        filter: { id: this.id },
        view: ["email", "nickname", "first_name", "last_name", "profile_picture"],
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
    await Db.update("users", { read_news: activeTime }, this.id);
  }

  async updateActive() {
    const activeTime = await utcFix();
    await Db.update("users", { active: activeTime }, this.id);
  }

  static async fetchData(filter, value) {
    if (filter === "email" && typeof value === "string") {
      try {
        const id = await Db.find("users", {
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
        const email = await Db.find("users", {
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
  return Db.toDateTime(utcfix);
}
