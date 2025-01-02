{/* <style>
:root {
  font-size: 62.5%;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}
html,
body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
body {
  display: flex;
  flex-direction: column;
}
h2 {
  color: #28638a;
  text-align: left;
  text-transform: uppercase;
  font-size: 3rem;
}
a {
  text-decoration: none;
}
img {
  display: block;
}
ul {
  list-style: none;
}
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background-color: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
}
:host {
  width: 100%;
  text-transform: uppercase;
  background-color: #28638a;
  color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: 0;
}
:host #logotype {
  margin-right: auto;
  overflow: hidden;
}
:host #logotype > a.logotype__home-link {
  padding: 1rem 1.2rem;
  color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  flex-wrap: nowrap;
  gap: 1.2rem;
}
:host #logotype > a.logotype__home-link .home-link__gc-icon {
  flex-shrink: 0;
  width: 5rem;
  height: 5rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0;
}
:host #logotype > a.logotype__home-link .home-link__gc-icon img {
  width: 100%;
  height: 100%;
}
:host #logotype > a.logotype__home-link h1 {
  font-size: 4rem;
  line-height: 5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
:host button#login-button,
:host button#logout-button {
  all: unset;
  padding: 2rem;
  text-align: center;
  font-size: 2rem;
  transition: all 0.3s;
  cursor: pointer;
  color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: 0;
}
:host button#login-button:hover,
:host button#logout-button:hover {
  background-color: rgba(0, 0, 0, 0.2);
}
:host a#user-settings {
  padding: 1.5rem;
  border-left: 2px solid #204c69;
  transition: all 0.3s;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: 0;
}
:host a#user-settings img {
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
}
:host a#user-settings:hover {
  background-color: rgba(0, 0, 0, 0.2);
}
:host #hamburguer-menu {
  font-size: 1.5rem;
  display: none;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 7rem;
  height: 7rem;
}
@media only screen and (max-width: 310px) {
  :host .home-link__gc-icon {
    display: none;
  }
}
@media only screen and (max-width: 880px) {
  :host * {
    display: none;
  }
  :host #logotype {
    display: block;
  }
  :host #hamburguer-menu {
    display: flex;
  }
}
</style> */}

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
