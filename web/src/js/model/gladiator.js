class Gladiator {
    constructor({ name }) {
        this.name = name;
    }

    async get() {
        return this;
    }
}

export default Gladiator;