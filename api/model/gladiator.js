import db from "../core/mysql.js";
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

    const gladiators = await db.find("gladiators", {
      filter: { name },
      view: [
        'cod', 'master', 'name', 'vstr', 'vagi', 'vint',
        'lvl', 'xp', 'skin', 'mmr', 'version'
      ],
    });

    if (!gladiators || gladiators.length === 0) {
      throw new CustomError(404, "No gladiators found with that name.");
    }

    return gladiators;
  }

  async getByCod(cod) {
    if (!cod) throw new CustomError(400, "Cod is required");

    const gladiators = await db.find("gladiators", {
      filter: { cod },
      view: [
        'cod', 'master', 'name', 'vstr', 'vagi', 'vint',
        'lvl', 'xp', 'skin', 'code', 'mmr', 'version'
      ],
    });

    if (!gladiators || gladiators.length === 0) {
      throw new CustomError(404, "Gladiator not found.");
    }

    return gladiators;
  }

  async getByMaster(master) {
    if (!master) throw new CustomError(400, "Master id is required");

    const gladiators = await db.find("gladiators", {
      filter: { master },
      view: [
        'cod', 'master', 'name', 'vstr', 'vagi', 'vint',
        'lvl', 'xp', 'skin', 'mmr', 'version'
      ],
    });

    if (!gladiators || gladiators.length === 0) {
      throw new CustomError(404, "No gladiators were found.");
    }

    return gladiators;
  }

  async checkGladiatorsNumberByMaster(master) {
    const gladiators = await db.find("gladiators", { filter: { master } });
    return { count: gladiators.length };
  }

  async getCodeById(cod, master) {
    if (!cod || !master) {
      throw new CustomError(400, "Cod and master are required.");
    }

    const gladiators = await db.find("gladiators", {
      filter: { cod },
      view: [
        'cod', 'master', 'name', 'vstr', 'vagi', 'vint',
        'lvl', 'xp', 'skin', 'code', 'blocks', 'mmr', 'version'
      ],
    });

    if (!gladiators || gladiators.length === 0) {
      throw new CustomError(404, "Gladiator not found.");
    }

    const gladiator = gladiators[0];

    if (gladiator.master !== master) {
      throw new CustomError(403, `Gladiator does not belong to ${master}.`);
    }

    const language = gladiator.blocks
      ? 'blocks'
      : codeLanguage(gladiator.code);

    return {
      cod: gladiator.cod,
      master: gladiator.master,
      name: gladiator.name,
      vstr: gladiator.vstr,
      vagi: gladiator.vagi,
      vint: gladiator.vint,
      lvl: gladiator.lvl,
      xp: gladiator.xp,
      skin: gladiator.skin,
      code: gladiator.code,
      blocks: gladiator.blocks,
      mmr: gladiator.mmr,
      version: gladiator.version,
      language
    };
  }

  async deleteGladiator(cod, master) {
    if (!cod || !master) throw new CustomError(400, "Cod and master are required.");

    const checkMaster = await db.find('gladiators', {
      filter: { cod },
      view: ['cod', 'master']
    });

    if (!checkMaster || checkMaster.length === 0) throw new CustomError(404, "Gladiator not found.");
    if (checkMaster[0].master !== master) throw new CustomError(403, "Gladiator does not belong to user.");

    await db.delete('gladiators', { cod });

    const occupiedSlots = (await this.checkGladiatorsNumberByMaster(master)).count;
    const totalSlots = await this.getUserSlots(master);

    return {
      code: 200,
      message: `Gladiator ${cod} has been deleted successfully.`,
      data: {
        occupiedSlots,
        totalSlots
      }
    };
  }

  async getUserSlots(master) {
    if (!master) throw new CustomError(400, "Master id is required.");

    const [user] = await db.find('users', {
      filter: { id: master },
      view: ['lvl']
    });

    if (!user) {
      throw new CustomError(404, "User not found.");
    }

    const lvl = user.lvl || 0;
    return Math.min(Math.floor(lvl / 10) + 1, 6);
  }

  static async createGladiator(master, gladData, version) {
    const { skin, name, vstr, vagi, vint, blocks = ''} = gladData

    let skinString;

    if (typeof skin === 'string') {
      try {
        const parsed = JSON.parse(skin);

        if (!Array.isArray(parsed)) {
          throw new CustomError("Skin must be a valid JSON array.");
        }
        skinString = skin;

      } catch (error) {
        throw new CustomError(400, "Invalid skin JSON format.");
      }

    } else if (Array.isArray(skin)) {
      skinString = JSON.stringify(skin);

    } else {
      throw new CustomError(400, "Skin must be either a JSON string or array.");
    }

    if (!master) throw new CustomError(400, "Master is required.");

    const nameRegex = /^[\w À-ú]+?$/;
    if(!nameRegex.test(name)) throw new CustomError(400, "Invalid name format.");

    if (!this.validateAttributes(vstr, vagi, vint)) throw new CustomError(400, "Invalid attribute values.");

    const isExistingName = await db.find('gladiators', {
      filter: { name },
      view: [ 'cod' ]
    });
    if (isExistingName.length > 0) throw new CustomError(400, "Name already exists.");

    const totalSlots = await this.getUserSlots(master);
    const usedSlots = await this.checkGladiatorsNumberByMaster(master);
    
    if(totalSlots <= usedSlots) throw new CustomError(400, `Gladiator limit reached: ${totalSlots}/${usedSlots}`);

    const insertResult = await db.insert('gladiators', {
      master: master,
      skin: skinString,
      name: name,
      vstr: parseInt(vstr),
      vagi: parseInt(vagi),
      vint: parseInt(vint),
      lvl: 1,
      xp: 0,
      blocks: blocks,
      version: version
    });

    return { ID: insertResult[0].insertId};
  }

  // Helpers convertidos da api em php
  static getSpriteHash(subject) {
    const pattern = /setSpritesheet\("([\d\w]*)"\);/;
    return this.codeMatch(subject, pattern);
  }

  static getSpriteName(subject) {
    const pattern = /setName\("([\d\w ]*)"\);/;
    return this.codeMatch(subject, pattern);
  }

  static getSpriteSTR(subject) {
    const pattern = /setSTR\(([\d]{1,2})\);/;
    return this.codeMatch(subject, pattern);
  }

  static getSpriteAGI(subject) {
    const pattern = /setAGI\(([\d]{1,2})\);/;
    return this.codeMatch(subject, pattern);
  }

  static getSpriteINT(subject) {
    const pattern = /setINT\(([\d]{1,2})\);/;
    return this.codeMatch(subject, pattern);
  }

  static codeMatch(subject, pattern) {
    const matches = subject.match(pattern);
    if (!matches || matches.length < 2) {
      return false;
    }
    return matches[1];
  }

  static validateAttributes(vstr, vagi, vint) {
    const total = this.calcAttrValue(parseInt(vstr)) + 
                  this.calcAttrValue(parseInt(vagi)) + 
                  this.calcAttrValue(parseInt(vint));
    return total === 50;
  }

  static calcAttrValue(attr) {
    if (attr === 0) return 0;
    return this.calcAttrValue(attr - 1) + Math.ceil(attr / 6);
  }

  static escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Helper
function codeLanguage(code) {
  let cScore = 0;
  let pyScore = 0;

  const cPatterns = [
    /#\s*include\s*<[^>]+>/,
    /\b(int|char|float|double|void)\b\s+\**\w+\s*\([^)]*\)\s*{/,
    /;\s*(\/\/.*)?$/m,
    /\bprintf\s*\(/,
    /\bscanf\s*\(/,
    /\bsizeof\s*\(/,
    /\bstruct\s+\w+/,
  ];

  const pythonPatterns = [
    /\bdef\s+\w+\s*\([^)]*\)\s*:/,
    /\bclass\s+\w+\s*:/m,
    /\bimport\s+\w+/,
    /print\s*\(/,
    /#[^\n]*$/,
    /\bself\b/,
    /:\s*$/m,
    /\bNone\b|\bTrue\b|\bFalse\b/,
  ];

  for (const pat of cPatterns) {
    if (pat.test(code)) cScore++;
  }
  for (const pat of pythonPatterns) {
    if (pat.test(code)) pyScore++;
  }

  const lines = code.split('\n');
  let indentCount = 0;
  for (const line of lines) {
    if (/^\s{4,}\S/.test(line)) indentCount++;
  }
  if (indentCount >= 2) pyScore += 1;

  let braceCount = 0;
  for (const line of lines) {
    if (/{\s*$/.test(line) || /^\s*}\s*$/.test(line)) braceCount++;
  }
  if (braceCount >= 2) cScore += 1;

  if (cScore > pyScore) return 'c';
  if (pyScore > cScore) return 'python';

  return 'python';
}
