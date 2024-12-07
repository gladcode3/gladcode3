import Api from "../helpers/api.js";

const api = new Api();

class Users {
    constructor() {
        this.apiInstance = api;
    }

    static async login() {
        const loginResponse = await this.apiInstance.post('users/login');
        return loginResponse;
    }
}

export default Users;
