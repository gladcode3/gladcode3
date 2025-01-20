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


import TemplateVar from './template-var.js';
import DynamicScript from './dynamic-script.js';
import Pledge from './pledge.js';
import LocalData from './local-data.js';
import JWTDecode from './jwt-decode.js';

// Symbol é usado como uma "chave de acesso" a propriedades e métodos privados.
const kLogged = Symbol('kLogged');
const kLoaded = Symbol('kLoaded');
const kStorageKey = Symbol('kStorageKey');
const kOnFailCallback = Symbol('kOnFailCallback');
const kOnSignInCallback = Symbol('kOnSignInCallback');
const kGenerateInitConfig = Symbol('kGenerateInitConfig');

export default class GoogleLogin {
    static [kLogged] = false;
    static [kLoaded] = false;
    static [kStorageKey] = 'user-session';
    static [kOnFailCallback] = null;
    static [kOnSignInCallback] = null;

    static [kGenerateInitConfig](auto, redirectUri, callback = _res => {}) {        
        const initConfig = {
            client_id: TemplateVar.get('googleClientId'),
            callback,
            auto_select: auto,
        }

        if (redirectUri) {
            initConfig.ux_mode = 'redirect';
            initConfig.login_uri = redirectUri;
        }

        return initConfig;
    }

    static async init({ redirectUri, auto=true } = {}) {
        if (this[kLoaded]) return GoogleLogin;

        const pledge = new Pledge();

        new DynamicScript('https://accounts.google.com/gsi/client', () => {            
            const handleCredentialResponse = async response => {
                this[kLogged] = true;
                GoogleLogin.saveCredential(response.credential);
            }

            const initConfig = this[kGenerateInitConfig](
                auto,
                redirectUri,
                handleCredentialResponse
            );
            google.accounts.id.initialize(initConfig);

            this[kLoaded] = true;
            pledge.resolve(GoogleLogin);
        });

        return pledge.get();
    }

    static isLoaded() {
        return this[kLoaded];
    }

    static renderButton(element) {
        if (!this[kLoaded]) {
            throw new Error('GoogleLogin not loaded');
        }
        // You can skip the next instruction if you don't want to show the "Sign-in" button
        google.accounts.id.renderButton(
            element, // Ensure the element exist and it is a div to display correcctly
            { theme: "outline", size: "large" }  // Customization attributes
        );
    }

    static async prompt() {
        if (!this[kLoaded]) {
            throw new Error('GoogleLogin not loaded');
        }
        
        google.accounts.id.prompt(notification => {
            if (!notification.isNotDisplayed()) return;

            if (this[kOnFailCallback]) {
                this[kOnFailCallback](notification);
            }
        });

        await this.waitLogged();
    }

    static async waitLogged() {
        const pledge = new Pledge();
        let interval = setInterval(() => {
            if (this[kLogged]) {
                clearInterval(interval);
                pledge.resolve();
            }
        }, 1000);
        return pledge.get();
    }

    static onFail(callback) {
        this[kOnFailCallback] = callback;
        return this;
    }

    static tokenIsExpired() {
        const jwt = this.getCredential();

        // Tokens não existentes ou com algum erro não são considerados expirados.
        if (!jwt) return false;
        if (!jwt.token) return false;

        const { exp: expires } = JWTDecode(jwt.token);
        const now = Date.now() / 1000;

        return expires <= now;
    }

    static saveCredential(credential) {
        new LocalData({ id: this[kStorageKey] })
            .set({ data: { token: credential } });
        
        if (this[kOnSignInCallback]) {
            this[kOnSignInCallback](credential);
        }
    }

    static getCredential() {
        return new LocalData({ id: this[kStorageKey] }).get();
    }

    static removeCredential() {
        new LocalData({ id: this[kStorageKey] }).remove();
    }

    static onSignIn(callback) {
        this[kOnSignInCallback] = callback;
        return this;
    }
}
