import HTMLParser from '../helpers/html-parser.js';
import Session from '../model/session.js';
import Users from '../model/users.js';

import './gc-nav.js';
import stylesRaw from '../../less/components/_header.less?raw';

// Symbol é usado como uma "chave de acesso" a propriedades e métodos privados.
const kLoginBtn = Symbol('kLoginBtn');
const kLogoutBtn = Symbol('kLogoutBtn');
const kUserLogged = Symbol('kUserLogged');
const kUserInfos = Symbol('kUserInfos');
const kSetRole = Symbol('kSetRole');
const kRender = Symbol('kRender');
const kHeader = Symbol('kHeader');
const kStyles = Symbol('kStyles');
const kLoadSessionInfos = Symbol('kLoadSessionInfos');
const kLoginCallback = Symbol('kLoginCallback');
const kLogoutCallback = Symbol('kLogoutCallback');

// <gc-header></gc-header>

class GladcodeHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this[kLoginBtn] = null;
        this[kLogoutBtn] = null;

        this[kUserLogged] = false;
        this[kUserInfos] = null;
    }

    [kSetRole]() {
        this.role = 'banner';
        this.setAttribute('role', 'banner')
    }

    connectedCallback() {
        this[kSetRole]();

        this[kLoadSessionInfos]();
        this[kRender]();
    }

    // Setup
    [kRender]() {
        this.shadowRoot.innerHTML = '';
        this[kLoginBtn] = null;
        this[kLogoutBtn] = null;
        this.shadowRoot.appendChild(this[kStyles]());

        this[kHeader](this[kUserInfos]).forEach(html_element => {
            this.shadowRoot.appendChild(html_element);
        });

        if (!this[kUserLogged] && !this[kLoginBtn]) {
            this[kLoginBtn] = this.shadowRoot.querySelector('#login-button');
            this[kLoginBtn].addEventListener('click', this[kLoginCallback]);
        }
        if (this[kUserLogged] && !this[kLogoutBtn]) {
            this[kLogoutBtn] = this.shadowRoot.querySelector('#logout-button');
            this[kLogoutBtn].addEventListener('click', this[kLogoutCallback]);
        }
    }

    [kHeader](user_infos) {
        const picture = (user_infos && user_infos.profile_picture) || './img/profile-photo-support.jpg';

        return HTMLParser.parseAll(`
            <div id="logotype">
                <a href="/" class="logotype__home-link">
                    <div aria-hidden="true" class="home-link__gc-icon">
                        <img src="/img/gc-icon.png" alt="ícone da gladcode">
                    </div>

                    <h1><span lang="en">Gladcode</span></h1>
                </a>
            </div>

            ${Session.userIsLogged()
                ? `<button id="logout-button" title="Encerrar sessão">Logout</button>`
                : `<button id="login-button" title="Entrar">Login</button>`
            }

            <gc-nav></gc-nav>

            ${Session.userIsLogged()
                ? `
                    <a href="#" id="user-settings" role="button" aria-label="configurações do usuário">
                        <img src="https://gladcode.dev/${picture}" alt="">
                    </a>
                `
                : ''
            }

            <div role="menu" aria-expanded="false" aria-label="menu" id="hamburguer-menu">
                <i class="fa-solid fa-bars fa-2xl"></i>
            </div>
        `);
    }

    [kStyles]() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }

    [kLoadSessionInfos]() {
        this[kUserLogged] = Session.userIsLogged();
        this[kUserInfos] = Users.getLocalUserData() || null;
    }

    async [kLoginCallback]() {
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

    [kLogoutCallback]() {
        sessionStorage.clear();
        Session.logout();
    }
}

customElements.define('gc-header', GladcodeHeader);
export default GladcodeHeader;
