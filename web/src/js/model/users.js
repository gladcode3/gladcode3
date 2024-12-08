import Api from "../helpers/api.js";

const api = new Api();

class Users {
    constructor() {
        this.api = api;
        console.log('this.api', api);
    }

    static async login() {
        const loginResponse = await this.api.post('users/login');
        
        console.log('loginResponse', loginResponse);
        return loginResponse;
    }
}

export default Users;
