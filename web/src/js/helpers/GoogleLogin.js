// Google Login helper
// USAGE:
// GoogleLogin.init(); // initialize the google login
// GoogleLogin.onFail(() => {}); // callback when the login fails (no account selected)
// GoogleLogin.onSignIn(() => {}); // callback when the login is successful
// GoogleLogin.prompt(); // prompt the user to login. It will redirect to ask for the google account or automatically login if the account is already selected. This is asynchronous, so you can await it.
// GoogleLogin.getCredential(); // get the google credential if it is saved (logged)
// GoogleLogin.saveCredential(credential); // save the google credential (login)
// GoogleLogin.removeCredential(); // remove the google credential (logout)
// GoogleLogin.isLoaded(); // check if the google login is loaded
// GoogleLogin.renderButton(element); // render the google login button in the element


import TemplateVar from './TemplateVar.js';
import DynamicScript from './DynamicScript.js';
import Pledge from './Pledge.js';
import LocalData from './LocalData.js';
import decodeJWT from './decodeJWT.js';

export default class GoogleLogin {
    static _logged = false;
    static _loaded = false;
    static _storageKey = 'user-session';
    static _onFailCallback = null;
    static _onSignInCallback = null;

    static _generateInitConfig(auto, redirectUri, callback = _res => {}) {        
        const initConfig = {
            client_id: TemplateVar.get('googleClientId'),
            callback,
            auto_select: auto,
        };

        if (redirectUri) {
            initConfig.ux_mode = 'redirect';
            initConfig.login_uri = redirectUri;
        }

        return initConfig;
    }

    static async init({ redirectUri, auto = true } = {}) {
        if (this._loaded) return GoogleLogin;

        const pledge = new Pledge();

        new DynamicScript('https://accounts.google.com/gsi/client', () => {            
            const handleCredentialResponse = async response => {
                this._logged = true;
                GoogleLogin.saveCredential(response.credential);
            };

            const initConfig = this._generateInitConfig(
                auto,
                redirectUri,
                handleCredentialResponse
            );
            google.accounts.id.initialize(initConfig);

            this._loaded = true;
            pledge.resolve(GoogleLogin);
        });

        return pledge.get();
    }

    static isLoaded() {
        return this._loaded;
    }

    static renderButton(element) {
        if (!this._loaded) {
            throw new Error('GoogleLogin not loaded');
        }
        google.accounts.id.renderButton(
            element,
            { theme: "outline", size: "large" }
        );
    }

    static async prompt() {
        if (!this._loaded) {
            throw new Error('GoogleLogin not loaded');
        }
        
        google.accounts.id.prompt(notification => {
            if (!notification.isNotDisplayed()) return;

            if (this._onFailCallback) {
                this._onFailCallback(notification);
            }
        });

        await this.waitLogged();
    }

    static async waitLogged() {
        const pledge = new Pledge();
        let interval = setInterval(() => {
            if (this._logged) {
                clearInterval(interval);
                pledge.resolve();
            }
        }, 1000);
        return pledge.get();
    }

    static onFail(callback) {
        this._onFailCallback = callback;
        return this;
    }

    static tokenIsExpired() {
        const jwt = this.getCredential();

        if (!jwt) return false;
        if (!jwt.token) return false;

        const { exp: expires } = decodeJWT(jwt.token);
        const now = Date.now() / 1000;

        return expires <= now;
    }

    static saveCredential(credential) {
        new LocalData({ id: this._storageKey })
            .set({ data: { token: credential } });
        
        if (this._onSignInCallback) {
            this._onSignInCallback(credential);
        }
    }

    static getCredential() {
        return new LocalData({ id: this._storageKey }).get();
    }

    static removeCredential() {
        new LocalData({ id: this._storageKey }).remove();
    }

    static onSignIn(callback) {
        this._onSignInCallback = callback;
        return this;
    }
}
