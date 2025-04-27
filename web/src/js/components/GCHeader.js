import HTMLParser from '../helpers/HTMLParser.js';
import Session from '../model/Session.js';

import './GCNavBar.js';
import './GCHamburguer.js'

import stylesRaw from '../../less/components/_header.less?raw';


// <gc-header></gc-header>

class GCHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._loginBtns = null;
        this._logoutBtns = null;

        this._userLogged = null;
        this._userInfos = null;
    }

    // Inherited

    connectedCallback() {
        // Compartilha as informações da sessão com a instância e observa modificações
        addEventListener('user-updated', () => {
            Session.shareSessionData(this);
        });

        Session.shareSessionData(this);

        this._setAttributes();

        this.shadowRoot.appendChild(this._styles);
        this._html.forEach(tag => this.shadowRoot.appendChild(tag));

        this._addEvents();
    }

    // Build

    _setAttributes() {
        this.setAttribute('role', 'banner')
    }

    get _styles() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }

    get _html() {
        let picture = this._userInfos ? this._userInfos?.profile_picture : '';

        if (picture && !picture.startsWith('https')) {
            // Caso a URL não esteja completa, joga ela para o domínio da GladCode V2.
            picture = `https://gladcode.dev/${picture}`;
        }

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
                    ${this._userLogged
                        ? `<button class="main-container__logout-btn logout-button" title="Encerrar sessão">Logout</button>`
                        : `<button class="main-container__login-btn login-button" title="Entrar">Login</button>`
                    }

                    <gc-nav class='main-container__nav'></gc-nav>

                    ${this._userLogged
                        ? `
                            <a class='main-container__user-settings' href="#" role="button" aria-label="configurações do usuário">
                                <img src="${picture}" alt="">
                            </a>
                        `
                        : ''
                    }
                </div>

                <gc-hamburguer
                    target='hamburguer-menu'
                    class="header-ui-container__hamburguer-menu"
                ></gc-hamburguer>
            </div>

            <article id='hamburguer-menu' class='menu-ui-container'></article>
        `);
    }

    _addEvents() {
        if (!this._userLogged && !this._loginBtns) {
            this._loginBtns = this.shadowRoot.querySelectorAll('.login-button');
            this._loginBtns.forEach(btn => btn
                .addEventListener('click', Session.userLogin));
            return;
        }
        if (this._userLogged && !this._logoutBtns) {
            this._logoutBtns = this.shadowRoot.querySelectorAll('.logout-button');
            this._logoutBtns.forEach(btn => btn
                .addEventListener('click', Session.userLogout));
            return;
        }
    }
}

customElements.define('gc-header', GCHeader);
export default GCHeader;
