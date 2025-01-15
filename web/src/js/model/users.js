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
}

export default Users;
