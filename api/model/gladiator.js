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
