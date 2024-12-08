class Gladiator {
  constructor({ id, master, name, vstr, vagi, vint, lvl, xp, skin, code, bloks, mmr, version }) {
      this.id = id;
      this.master = master;
      this.name = name;
      this.vstr = vstr;
      this.vagi = vagi;
      this.vint = vint;
      this.lvl = lvl;
      this.xp = xp;
      this.slin = skin;
      this.code = code;
      this.blocks = blocks;
      this.mmr = mmr;
      this.version = version;
  }

  async get() {
      return this;
  }
}

export default Gladiator;