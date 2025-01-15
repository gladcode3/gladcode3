import Toast from "../components/toast.js";
import Api from "../helpers/api.js";
import GoogleLogin from "../helpers/google-login.js";
import LocalData from "../helpers/local-data.js";
import Users from "./users.js";

// Symbol é usado como uma "chave de acesso" a propriedades e métodos privados.
const kStorageKey = Symbol('kStorageKey');
const kApi = Symbol('kApi');
const kSetApiInstance = Symbol('kSetApiInstance');
const kRemoveLocalInfo = Symbol('kRemoveLocalInfo');

class Session {
    static [kStorageKey] = 'api-token'; 
    static [kApi] = null;

    static [kSetApiInstance]() {
        if (!GoogleLogin.getCredential())
            throw new Error('google credentials not founded');

        try {
            if (!this[kApi]) this[kApi] = new Api();
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    static [kRemoveLocalInfo]() {
        GoogleLogin.removeCredential();
        Users.removeLocalUserData();
    }

    // Methods:

    static async googleAuth() {
        await GoogleLogin.init({ auto: false });

        let credential = GoogleLogin.getCredential();

        if (credential === 'expired') {
            this[kRemoveLocalInfo]();

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
        this[kSetApiInstance]();

        const loginResponse = await this[kApi].post('users/login')
            .catch(e => console.error(e));

        if (!loginResponse?.token) return loginResponse;
        
        // Save local data
        await Users.saveLocalUserData()
            .catch(e => console.error(e));

        return loginResponse;
    }

    static logout() {
        this[kRemoveLocalInfo]();
        location.href = '/';
    }
    
    // Token methods
    static getToken() {
        const data = new LocalData({ id: this[kStorageKey] }).get();
        return data;
    }

    static saveToken(loginRes) {
        if (!loginRes?.token) return;

        new LocalData({ id: this[kStorageKey] })
            .set({ data: loginRes.token });
    }

    static removeToken() {
        new LocalData({ id: this[kStorageKey] }).remove();
    }
}

export default Session;
