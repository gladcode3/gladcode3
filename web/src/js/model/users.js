import Api from "../helpers/api.js";
import LocalData from "../helpers/local-data.js";


class Users {
    static storageKey = 'user-infos';
    static api = null;

    static setApiInstance() {
        if (!this.api) this.api = new Api();
    }

    static async getUserData() {
        this.setApiInstance();
        return await this.api.get('users/user');
    }

    static async getUserByName(name) {
        this.setApiInstance();

        return await this.api.get(`users/${name}`);;
    }

    // Local user data methods
    static getLocalUserData() {
        const data = new LocalData({ id: this.storageKey }).get();
        return data;
    }

    static async saveLocalUserData() {
        const userData = await this.getUserData();

        new LocalData({ id: this.storageKey })
            .set({ data: userData });
    }

    static async removeLocalUserData() {
        // console.log('Users.removeLocalUserData...');
        new LocalData({ id: this.storageKey }).remove();
    }
}

export default Users;
