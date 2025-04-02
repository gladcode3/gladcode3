import Api from "../helpers/api.js";
import LocalData from "../helpers/local-data.js";

// Symbol é usado como uma "chave de acesso" a propriedades e métodos privados.
const kStorageKey = Symbol('kStorageKey');
const kApi = Symbol('kApi');
const kSetApiInstance = Symbol('kSetApiInstance');

class Users {
    static [kStorageKey] = 'user-infos';
    static [kApi] = null;

    static [kSetApiInstance]() {
        try {
            if (!this[kApi]) this[kApi] = new Api();
        } catch(err) {
            console.log(err);
            throw err;
        }
    }

    static async getUserData() {
        this[kSetApiInstance]();
        return await this[kApi].get('users/user');
    }

    static async getUserByName(name) {
        this[kSetApiInstance]();
        return await this[kApi].get(`users/${name}`);
    }

    // Prototype:
    static async update({ nickname, prefLanguage }) {
        this[kSetApiInstance]();

        const { nickname: oldNickname, profile_picture: pfp } = Users.getLocalUserData();

        const newNickname = nickname || oldNickname;
        
        // Update:
        const updatedUser = await this[kApi].put('users/user', {
            nickname: newNickname,
            pfp,
            prefLanguage
        });

        if (!updatedUser.user) throw new Error('failed to update!');

        this.saveLocalUserData()
    }

    // Local user data methods
    static getLocalUserData() {
        const data = new LocalData({ id: this[kStorageKey] }).get();
        return data;
    }

    static async saveLocalUserData() {
        const userData = await this.getUserData();

        new LocalData({ id: this[kStorageKey] })
            .set({ data: userData });
    }

    static async removeLocalUserData() {
        new LocalData({ id: this[kStorageKey] }).remove();
    }

    // Calculate xp for next lvl
    static calcXpToNextLvl({ lvl }) {
        const firstWeight = 1.9;
        const secondWeight = 130;

        return (parseInt(lvl) * firstWeight + 1) * secondWeight;
    }
}

export default Users;
