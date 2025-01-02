import Toast from "../components/toast.js";
import Api from "../helpers/api.js";
import GoogleLogin from "../helpers/google-login.js";
import LocalData from "../helpers/local-data.js";
import Users from "./users.js";


class Session {
    static storageKey = 'api-token'; 
    static api = null;

    static #setApiInstance() {
        if (!GoogleLogin.getCredential())
            throw new Error('google credentials not founded');

        if (!this.api) this.api = new Api();
    }

    static #removeLocalInfo() {
        GoogleLogin.removeCredential();
        Users.removeLocalUserData();
    }

    // Methods:

    static async googleAuth() {
        await GoogleLogin.init({ auto: false });

        let credential = GoogleLogin.getCredential();

        if (credential === 'expired') {
            this.#removeLocalInfo();

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
            console.log('sucess');
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
        if (!credential) this.logout();
        
        // have a credential, but it has not expired
        if (credential !== 'expired') return;
        
        // expired credential:
        new Toast(
            'Sua sessão expirou. Por favor, faça login novamente.',
            { type: 'error' }
        );
        
        this.logout();
    }

    static userIsLogged() {
        const credential = GoogleLogin.getCredential();
        if (!credential) return false;

        return credential !== 'expired';
    }
    
    static async login() {
        this.#setApiInstance();

        const loginResponse = await this.api.post('users/login')
            .catch(e => console.error(e));

        if (!loginResponse.token) return loginResponse;
        
        // Save local data
        await Users.saveLocalUserData()
            .catch(e => console.error(e));

        return loginResponse;
    }

    static logout() {
        this.#removeLocalInfo();
        location.href = '/';
    }
    
    // Token methods
    static getToken() {
        const data = new LocalData({ id: this.storageKey }).get();
        return data;
    }

    static saveToken(loginRes) {
        if (!loginRes.token) return;

        new LocalData({ id: this.storageKey })
            .set({ data: loginRes.token });
    }

    static removeToken() {
        new LocalData({ id: this.storageKey }).remove();
    }
}

export default Session;
