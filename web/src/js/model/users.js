import Api from "../helpers/api.js";
import LocalData from "../helpers/local-data.js";


class Users {
    static async getUserData() {
        const api = new Api();
        const data = await api.get('users/user');
        console.log(data);
        return data;
    }

    static async getUserByName(name) {
        const api = new Api();
        return await api.get(`users/${name}`);;
    }
}

export default Users;
