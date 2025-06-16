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
    try {
      const gladiators = await db.find("gladiators", {
        filter: { name },
        view: ['cod', 'master', 'name', 'vstr', 'vagi', 'vint', 'lvl', 'xp', 'skin', 'mmr', 'version'],
      });

      return gladiators;
    } catch (error) {
      throw new CustomError(
        error.code ?? 500,
        error.message ?? "internal server error"
      );
    }
  }

  async getByCod(cod) {
    if (!cod) throw new CustomError(400, "Cod is required");
    try {

      const gladiators = await db.find("gladiators", {
        filter: { cod },
        view: ['cod', 'master', 'name', 'vstr', 'vagi', 'vint', 'lvl', 'xp', 'skin', 'code', 'mmr', 'version'],
      });
      
      return gladiators;
    } catch (error) {
      throw new CustomError(
        error.code ?? 500,
        error.message ?? "internal server error"
      );
    }
  }

  async getByMaster(master) {
    if (!master) throw new CustomError(400, "Master id is required");

    const gladiators = await db.find("gladiators", {
      filter: { master: master },
      view: ['cod', 'master', 'name', 'vstr', 'vagi', 'vint', 'lvl', 'xp', 'skin', 'mmr', 'version'],
    });

    if(gladiators.length === 0 || !gladiators){
      throw new CustomError(404, "No gladiators were found.");
    }
    return gladiators;
  }

  // checar se o usuário possui mais de 6 gladiadores para impedir de criar um novo gladiador
  async checkGladiatorsNumberByMaster(master) {
    try {
      const gladiators = await db.find("gladiators", {
        filter: { master },
      });

      return { count: gladiators.length };
    } catch (error) {
      throw new CustomError(
        error.code ?? 500,
        error.message ?? "internal server error"
      );
    }
  }

  async getCodeById(cod, master) {

    const gladiator = await db.find("gladiators", {
      filter: { cod },
      view: ['cod', 'master', 'name', 'vstr', 'vagi', 'vint', 'lvl', 'xp', 'skin', 'code', 'blocks', 'mmr', 'version'],
    })

    if (gladiator.length === 0) { throw new CustomError(404, "Gladiator not found"); }
    if (gladiator[0].master !== master) { throw new CustomError(403, `Gladiator does not belong to ${master}.`); }

  const language = gladiator[0].blocks ? 'blocks' : codeLanguage(gladiator[0].code);

  return {
      cod: gladiator[0].cod,
      master: gladiator[0].master,
      name: gladiator[0].name,
      vstr: gladiator[0].vstr,
      vagi: gladiator[0].vagi,
      vint: gladiator[0].vint,
      lvl: gladiator[0].lvl,
      xp: gladiator[0].xp,
      skin: gladiator[0].skin,
      code: gladiator[0].code,
      blocks: gladiator[0].blocks,
      mmr: gladiator[0].mmr,
      version: gladiator[0].version,
      language
    };
  }
}

// Não escrevi esse código mas ele passou em todos os testes. Ele é bem leve também.
function codeLanguage(code) {
    let cScore = 0;
    let pyScore = 0;

    const cPatterns = [
        /#\s*include\s*<[^>]+>/,                      // #include <...>
        /\b(int|char|float|double|void)\b\s+\**\w+\s*\([^)]*\)\s*{/, // C functions
        /;\s*(\/\/.*)?$/m,                            // Lines ending with ;
        /\bprintf\s*\(/,                              // printf(
        /\bscanf\s*\(/,                               // scanf(
        /\bsizeof\s*\(/,                              // sizeof(
        /\bstruct\s+\w+/,                             // struct
    ];

    const pythonPatterns = [
        /\bdef\s+\w+\s*\([^)]*\)\s*:/,                // def func(...):
        /\bclass\s+\w+\s*:/m,                         // Python classes
        /\bimport\s+\w+/,                             // Module imports
        /print\s*\(/,                                 // print(
        /#[^\n]*$/,                                   // Python comments
        /\bself\b/,                                   // Python methods
        /:\s*$/m,                                     // Indent blocks ( : )
        /\bNone\b|\bTrue\b|\bFalse\b/,                // Python literals
    ];

    for (const pat of cPatterns) { if (pat.test(code)) cScore++; }
    for (const pat of pythonPatterns) { if (pat.test(code)) pyScore++; }

    const lines = code.split('\n');
    let indentCount = 0;
    for (const line of lines) { if (/^\s{4,}\S/.test(line)) indentCount++; }
    if (indentCount >= 2) { pyScore += 1; }

    let braceCount = 0;
    for (const line of lines) { if (/{\s*$/.test(line) || /^\s*}\s*$/.test(line)) braceCount++; }
    if (braceCount >= 2) { cScore += 1; }

    if (cScore > pyScore) return 'c';
    if (pyScore > cScore) return 'python';

    return 'python';
}

