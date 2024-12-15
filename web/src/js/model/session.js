import Toast from "../components/toast.js";
import Api from "../helpers/api.js";
import GoogleLogin from "../helpers/google-login.js";
import LocalData from "../helpers/local-data.js";
import Users from "./users.js";

const storageKey = 'api-token'; 

class Session {
    static async googleAuth() {
        await GoogleLogin.init({ auto: false });

        let credential = GoogleLogin.getCredential();

        if (credential === 'expired') {
            GoogleLogin.removeCredential();
            Users.removeToken();

            new Toast(
                'Sua sessão expirou. Por favor, faça login novamente.',
                { type: 'error' }
            );

            credential = null;
        }

        const onFailE = async () => {
            const loginBtn = document.querySelector('#button-login');
            GoogleLogin.renderButton(loginBtn);
        };

        const onSucessE = () => {
            console.log('sucess', GoogleLogin.getCredential());
            // location.href = '/dashboard';
        };

        GoogleLogin.onFail(onFailE);
        GoogleLogin.onSignIn(onSucessE);

        if (credential) {
            onSucessE();
            return;
        }

        await GoogleLogin.prompt();
    }

    static validate() {
        const credential = GoogleLogin.getCredential();

        if (!credential) location.href = '/';

        if (credential === 'expired') {
            new Toast(
                'Sua sessão expirou. Por favor, faça login novamente.',
                { type: 'error' }
            );
            
            location.href = '/';
        }
    }
    
    static async login(apiInstance) {
        const api = apiInstance || new Api();

        if (!(api instanceof Api)) {
            console.error('api is not an instance of Api');
            throw new TypeError('api is not an instance of Api');
        }

        const loginResponse = await api.post('users/login')
            .catch(e => console.error(e));

        if (!loginResponse.token) return loginResponse;
        
        this.setToken(loginResponse);
        return loginResponse;
    }

    static setToken(loginRes) {
        if (!loginRes.token) return;

        const localData = new LocalData({ id: storageKey });
        localData.set({ data: loginRes });
    }

    static getToken() {
        const token = new LocalData({ id: storageKey }).get();
        return token;
    }

    static removeToken() {
        new LocalData({ id: storageKey }).remove();
    }
}

export default Session;
