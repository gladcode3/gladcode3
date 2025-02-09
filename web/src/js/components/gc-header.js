import HTMLParser from '../helpers/html-parser.js';
import Session from '../model/session.js';
import Users from '../model/users.js';

import './gc-nav.js';
import stylesRaw from '../../less/components/_header.less?raw';

// Symbol é usado como uma "chave de acesso" a propriedades e métodos privados.
const kLoginBtns = Symbol('kLoginBtn');
const kLogoutBtns = Symbol('kLogoutBtn');
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

        this[kLoginBtns] = null;
        this[kLogoutBtns] = null;

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
        this[kLoginBtns] = null;
        this[kLogoutBtns] = null;
        this.shadowRoot.appendChild(this[kStyles]());

        this[kHeader](this[kUserInfos]).forEach(html_element => {
            this.shadowRoot.appendChild(html_element);
        });

        if (!this[kUserLogged] && !this[kLoginBtns]) {
            this[kLoginBtns] = this.shadowRoot.querySelectorAll('.login-button');
            this[kLoginBtns]
                .forEach(btn => btn
                    .addEventListener('click', this[kLoginCallback]));
            return;
        }
        if (this[kUserLogged] && !this[kLogoutBtns]) {
            this[kLogoutBtns] = this.shadowRoot.querySelectorAll('.logout-button');
            this[kLogoutBtns]
                .forEach(btn => btn
                    .addEventListener('click', this[kLogoutCallback]));
            return;
        }
    }

    [kHeader](user_infos) {
        const nickname = user_infos && (user_infos.nickname || 'User');
        const picture = user_infos
            ? user_infos.profile_picture
            : './img/profile-photo-support.jpg';

        return HTMLParser.parseAll(`
            <div class="header-ui-container">
                <div class="header-ui-container__logotype">
                    <a class="logotype__home-link" href="/">
                        <div class="home-link__gc-icon" aria-hidden="true">
                            <img src="/img/gc-icon.png" alt="logo da gladcode">
                        </div>

                        <h1 class='home-link__title'><span lang="en">Gladcode</span></h1>
                    </a>
                </div>

                <div class="header-ui-container__main-container">
                    ${Session.userIsLogged()
                        ? `<button class="main-container__logout-btn logout-button" title="Encerrar sessão">Logout</button>`
                        : `<button class="main-container__login-btn login-button" title="Entrar">Login</button>`
                    }

                    <gc-nav class='main-container__nav'></gc-nav>

                    ${Session.userIsLogged()
                        ? `
                            <a class='main-container__user-settings' href="#" role="button" aria-label="configurações do usuário">
                                <img src="https://gladcode.dev/${picture}" alt="">
                            </a>
                        `
                        : ''
                    }
                </div>

                <div class="header-ui-container__hamburguer-menu hamburguer-menu" role="menu" aria-expanded="false" aria-label="menu">
                    <i class="fa-solid fa-bars fa-2xl"></i>
                </div>
            </div>

            <article class="menu-ui-container">
                <section class='menu-ui-container__user-session'>
                    ${Session.userIsLogged()
                        ? `
                            <div class='user-session__user'>
                                <a class="user__user-settings" href="#" role="button" aria-label="configurações do usuário">
                                    <div class='user-settings__picture'>
                                        <img src="https://gladcode.dev/${picture}" alt="">
                                    </div>

                                    <span class='user-settings__username'>${nickname}</span>
                                </a>
                            </div>

                            <button class="user-session__logout-btn logout-button" title="Encerrar sessão">
                                <i class="fa-solid fa-right-from-bracket"></i>
                                <span class='logout-btn__label'>Logout</span>
                            </button>
                        `
                        : `
                            <button class="user-session__login-btn login-button" title="Entrar">
                                <i class="fa-solid fa-right-to-bracket"></i>
                                <span class='login-btn__label'>Login</span>
                            </button>
                        `
                    }
                </section>

                <gc-nav class='menu-ui-container__nav' direction="column"></gc-nav>
            </article>
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
