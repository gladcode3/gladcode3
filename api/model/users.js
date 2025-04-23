import CustomError from "../core/error.js";
import Db from "../core/mysql.js";

export default class User {
  constructor({
    id,
    email,
    googleid,
    nickname,
    firstName,
    lastName,
    profilePicture,
    pasta,
  }) {
    this.id = id;
    this.email = email;
    this.googleid = googleid;
    this.nickname = nickname;
    this.firstName = firstName;
    this.lastName = lastName;
    this.profilePicture = profilePicture;
    this.pasta = pasta;
  }

  async delete() {
    return Db.delete("users", this.id);
  }

  async add() {
    if (!this.email || !this.googleid || !this.nickname || !this.firstName || !this.lastName || !this.profilePicture || !this.pasta) {
      throw new CustomError(400, "Missing required fields");
    }

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
  }

  static async getByNickname(nickname) {
    if (!nickname) throw new CustomError(400, "Nickname is required");

    const users = await Db.find("users", {
      filter: { nickname: { like: nickname } },
      view: ['id', 'email', 'nickname', 'profile_picture', 'lvl', 'xp', 'silver', 'credits', 'active'],
      opt: { limit: 20 },
    });

    return users;
  }

  static async getById(id) {
    if (!id) throw new CustomError(400, "ID is required");

    const users = await Db.find("users", {
      filter: { id },
      view: ['id', 'email', 'nickname', 'profile_picture', 'lvl', 'xp', 'silver', 'credits', 'active']
    });

    return users;
  }

  async update(body) {

    const validLanguages = new Set(["c", "python", "blocks"]);
    const userPref = body.userPref ?? {};
    const isValid = (value) => value !== undefined && value !== null && value !== '';
    const toInt = (value) => { if (typeof value === 'boolean') return value ? 1 : 0; else return undefined };
    
    const updateData = Object.fromEntries(
      Object.entries({
        nickname: body.nickname,
        profile_picture: body.pfp,

        pref_message: toInt(userPref.pref_message),
        pref_friend: toInt(userPref.pref_friend),
        pref_update: toInt(userPref.pref_update),
        pref_duel: toInt(userPref.pref_duel),
        pref_tourn: toInt(userPref.pref_tourn),

        pref_language: validLanguages.has(userPref.pref_language) ? userPref.pref_language : undefined
      }).filter(([_, value]) => isValid(value))
    );
    
    if (Object.keys(updateData).length === 0) {
      throw new CustomError(400, "No valid data sent");
    }

    await Db.update('users', updateData, this.id);
    return this.get();
  }

  static async getNameList() {
    const users = await Db.find("users", {
      view: ['id', 'email', 'nickname', 'profile_picture', 'lvl', 'xp', 'silver', 'credits', 'active'],
      opt: {
        order: {
          active: -1,
        },
        limit: 20,
      },
    });

    return users;
  }

  async get() {
    const user = await Db.find("users", {
      filter: { id: this.id },
      view: ["id", "email", "nickname", "first_name", "last_name", "profile_picture", "spoken_language", 'lvl', 'xp', 'silver', 'credits', 'active', 'pref_message', 'pref_friend', 'pref_update', 'pref_duel', 'pref_tourn', 'pref_language'],
    });

    if (user.length === 0) throw new CustomError(404, "User does not exist");
    return user[0];
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
      const id = await Db.find("users", {
        filter: { email: value },
        view: ["id"],
        opt: { limit: 1 },
      });

      if (id.length === 0) throw new CustomError(404, "User not Found");

      return { code: 200, id: id[0].id };
    } else if (filter === "id") {
      const email = await Db.find("users", {
        filter: { id: value },
        view: ["email"],
        opt: { limit: 1 },
      });

      if (email.length === 0) throw new CustomError(404, "User not Found");

      return { code: 200, email: email[0].email };
    }
  }
}

async function utcFix() {
  const now = Date.now();
  const utcfix = now - 3 * 60 * 60 * 1000;
  return Db.toDateTime(utcfix);
}
