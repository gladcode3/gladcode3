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
import GladcodeV2API from './request-old.js';


export default class GoogleLogin {
    static logged = false;
    static loaded = false;
    static storageKey = 'user-session';
    static onFailCallback = null;
    static onSignInCallback = null;

    static #generateInitConfig(auto, redirectUri, callback = _res => {}) {        
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
        if (GoogleLogin.loaded) return GoogleLogin;

        // this.GCAPIv2 = new GladcodeV2API({ url: TemplateVar.get('oldApi') });

        const pledge = new Pledge();

        new DynamicScript('https://accounts.google.com/gsi/client', () => {
            // console.log('Script do Google carregado');
            
            async function handleCredentialResponse(response) {
                console.log('handleCredentialResponse()', response);
                GoogleLogin.logged = true;
                GoogleLogin.saveCredential(response.credential);
            }

            const initConfig = this.#generateInitConfig(
                auto,
                redirectUri,
                handleCredentialResponse
            );
            google.accounts.id.initialize(initConfig);

            GoogleLogin.loaded = true;
            pledge.resolve(GoogleLogin);
        });

        return pledge.get();
    }

    static isLoaded() {
        return GoogleLogin.loaded;
    }

    static renderButton(element) {
        if (!GoogleLogin.loaded) {
            throw new Error('GoogleLogin not loaded');
        }
        // You can skip the next instruction if you don't want to show the "Sign-in" button
        google.accounts.id.renderButton(
            element, // Ensure the element exist and it is a div to display correcctly
            { theme: "outline", size: "large" }  // Customization attributes
        );
    }

    static async prompt() {
        if (!GoogleLogin.loaded) {
            throw new Error('GoogleLogin not loaded');
        }
        
        google.accounts.id.prompt(notification => {
            console.log('notification', notification);

            if (!notification.isNotDisplayed()) return;

            if (GoogleLogin.onFailCallback) {
                GoogleLogin.onFailCallback(notification);
            }
        });

        await GoogleLogin.waitLogged();
    }

    static async waitLogged() {
        const pledge = new Pledge();
        let interval = setInterval(() => {
            if (GoogleLogin.logged) {
                clearInterval(interval);
                pledge.resolve();
            }
        }, 1000);
        return pledge.get();
    }

    static onFail(callback) {
        GoogleLogin.onFailCallback = callback;
        return GoogleLogin;
    }

    static saveCredential(credential) {
        console.log('Salvando credencial:', credential);

        new LocalData({ id: GoogleLogin.storageKey }).set({ data: { token: credential } });
        
        if (GoogleLogin.onSignInCallback) {
            GoogleLogin.onSignInCallback(credential);
        }
    }

    static getCredential() {
        return new LocalData({ id: GoogleLogin.storageKey }).get();
    }

    static removeCredential() {
        new LocalData({ id: GoogleLogin.storageKey }).remove();
    }

    static onSignIn(callback) {
        GoogleLogin.onSignInCallback = callback;
        return GoogleLogin;
    }
}
