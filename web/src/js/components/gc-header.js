import _GladcodeNavBar from './gc-nav.js';
import HTMLParser from '../helpers/html-parser.js';
import Session from '../model/session.js';
import Users from '../model/users.js';

import stylesRaw from '../../less/components/_header.less?raw';

// <gc-header></gc-header>

class GladcodeHeader extends HTMLElement {
    constructor() {
        super();
        this.role = 'banner';
        this.setAttribute('role', 'banner')
        this.attachShadow({ mode: 'open' });

        this.loginBtn = null;
        this.logoutBtn = null;

        this.userLogged = false;
        this.userInfos = null;
    }

    connectedCallback() {
        this.#loadSessionInfos();
        this.#render();
    }

    // Setup
    #render() {
        this.shadowRoot.innerHTML = '';
        this.loginBtn = null;
        this.logoutBtn = null;
        this.shadowRoot.appendChild(this.#styles());

        this.#header().forEach(html_element => {
            this.shadowRoot.appendChild(html_element);
        });

        if (!this.userLogged && !this.loginBtn) {
            this.loginBtn = this.shadowRoot.querySelector('#login-button');
            this.loginBtn.addEventListener('click', this.#login);
        }
        if (this.userLogged && !this.logoutBtn) {
            this.logoutBtn = this.shadowRoot.querySelector('#logout-button');
            this.logoutBtn.addEventListener('click', this.#logout);
        }
    }

    #header({ profile_picture } = {}) {
        const defaultPicturePath = './img/profile-photo-support.jpg';

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
                        <img src="${profile_picture || defaultPicturePath}" alt="">
                    </a>
                `
                : ''
            }

            <div role="menu" aria-expanded="false" aria-label="menu" id="hamburguer-menu">
                <i class="fa-solid fa-bars fa-2xl"></i>
            </div>
        `);
    }

    #styles() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }

    // Métodos privados
    #loadSessionInfos() {
        this.userLogged =  Session.userIsLogged();
        this.userInfos = Users.getLocalUserData() || null;
    }

    async #login() {
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

    #logout() {
        sessionStorage.clear();
        Session.logout();
    }
}

customElements.define('gc-header', GladcodeHeader);
export default GladcodeHeader;
