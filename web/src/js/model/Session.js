import Toast from "../components/Toast.js";
import Api from "../helpers/Api.js";
import GoogleLogin from "../helpers/GoogleLogin.js";
import LocalData from "../helpers/LocalData.js";
import Users from "./Users.js";


class Session {
    static _storageKey = 'api-token'; 
    static _api = null;
    

    static _setApiInstance() {
        if (!GoogleLogin.getCredential())
            throw new Error('google credentials not founded');

        try {
            if (!this._api) this._api = new Api();
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    static _removeLocalInfo() {
        GoogleLogin.removeCredential();
        Users.removeLocalUserData();
    }

    // Methods:

    static async googleAuth() {
        await GoogleLogin.init({ auto: false });

        let credential = GoogleLogin.getCredential();

        if (credential === 'expired') {
            this._removeLocalInfo();

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
        if (!GoogleLogin.getCredential()) {
            this.logout();
            return;
        }

        if (!GoogleLogin.getCredential().token) {
            this.logout();
            return;
        }
        
        // have a credential, but it has not expired
        if (!GoogleLogin.tokenIsExpired()) return;
        
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
        if (!credential.token) return false;

        return !GoogleLogin.tokenIsExpired();
    }
    
    static async login() {
        this._setApiInstance();

        const loginResponse = await this._api.post('users/login')
            .catch(e => console.error(e));

        if (!loginResponse?.token) return loginResponse;
        
        // Save local data
        await Users.saveLocalUserData()
            .catch(e => console.error(e));

        return loginResponse;
    }

    static logout() {
        this._removeLocalInfo();
        location.href = '/';
    }
    
    // Token methods
    static getToken() {
        const data = new LocalData({ id: this._storageKey }).get();
        return data;
    }

    static saveToken(loginRes) {
        if (!loginRes?.token) return;

        new LocalData({ id: this._storageKey })
            .set({ data: loginRes.token });
    }

    static removeToken() {
        new LocalData({ id: this._storageKey }).remove();
    }

    // Share

    static shareSessionData(objectInstance = {}, info='all') {
        const infosMap = {
            'user-logged': () => objectInstance._userLogged = Session.userIsLogged(),
            'user-infos': () => objectInstance._userInfos = Users.getLocalUserData() || null,
            'all': function() {
                this['user-logged']();
                this['user-infos']();
            }
        };

        infosMap[info]();
    }

    // Interface LOGIN/LOGOUT

    static async userLogin() {
        const homeURL = `https://${location.hostname}/`;
        if (location.href !== homeURL) {
            console.error('only home page can login');
            throw new Error('only home page can login');
        }

        await Session.googleAuth()
            .catch(e => console.error(e));
        
        const loginData = await Session.login()
            .catch(e => console.error(e));

        if (loginData.token) location.href = '/dashboard';
    }

    static userLogout() {
        sessionStorage.clear();
        Session.logout();
    }
}

export default Session;
