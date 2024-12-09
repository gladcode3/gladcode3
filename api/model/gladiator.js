import { db } from "../core/mysql.js";
import CustomError from "../core/error.js";

export default class Gladiator {
  constructor({
    id,
    master,
    name,
    vstr,
    vagi,
    vint,
    lvl,
    xp,
    skin,
    code,
    blocks,
    mmr,
    version,
  }) {
    this.id = id;
    this.master = master;
    this.name = name;
    this.vstr = vstr;
    this.vagi = vagi;
    this.vint = vint;
    this.lvl = lvl;
    this.xp = xp;
    this.skin = skin;
    this.code = code;
    this.blocks = blocks;
    this.mmr = mmr;
    this.version = version;
  }

  async getByName(name) {
    if (!name) throw new CustomError(400, "Name is required");

    try {
      const [rows] = await db.execute(
        "SELECT * FROM gladiators WHERE name = ?",
        [name]
      );

      if (rows.length === 0)
        throw new CustomError(
          404,
          "No gladiators found with the given name"
        );
      return rows;
    } catch (error) {
      console.error(`Error in getByName: ${error.message}`);
      throw new CustomError(500, "Internal server error");
    }
  }

  async getByCod(cod) {
    if (!cod) throw new CustomError(400, "Cod is required");
    try {
      const [rows] = await db.execute(
        "SELECT * FROM gladiators WHERE cod = ?",
        [cod]
      );

      if (rows.length === 0)
        throw new CustomError(404, "No gladiators found with the given cod");
      return rows;
    } catch (error) {
      console.error(`Error in getByName: ${error.message}`);
      throw new CustomError(500, "Internal server error");
    }
  }

  async getByMaster(master) {
    if (!master) throw new CustomError(400, "Master id is required");

    try {
      const [rows] = await db.execute(
        "SELECT * FROM gladiators WHERE master = ?",
        [master]
      );

      if (rows.length === 0)
        throw new CustomError(404, "No gladiators found with the given name");
      return rows;
    } catch (error) {
      console.error(`Error in getByName: ${error.message}`);
      throw new CustomError(500, "Internal server error");
    }
  }

  // checar se o usuário possui mais de 6 gladiadores para impedir de criar um novo gladiador
  async checkGladiatorsNumberByMaster(master) {
    try {
      const [rows] = await db.execute(
        "SELECT COUNT(*) AS gladiator_count FROM gladiators WHERE master = ?",
        [master]
      );

      if (rows && rows.length > 0) {
        return { count: rows[0].gladiator_count };
      }

      return { count: 0 };
    } catch (error) {
      console.error(`Error in checkGladiatorNumbersByMaster: ${error.message}`);
      throw new CustomError(500, "Internal server error");
    }
  }
}
