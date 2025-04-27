import HTMLParser from "../helpers/html-parser.js";
import asyncTimeout from "../helpers/async-timeout.js";
import Session from "../model/session.js";

import stylesRaw from '../../less/components/_hamburguer.less?raw';


// <gc-hamburguer target=''></gc-hamburguer>

class GCHamburguer extends HTMLElement {
    static observedAttributes = ['target'];

    static _closedIcon = '☰';
    static _openIcon = '✕';
    static _onUserUpdated = () => {
        Session.shareSessionData(this);

        this._setupTarget();
        this._addEvents();
    };

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._root = this._findParentShadowRoot() || document;

        this.open = false;

        this._userLogged = null;
        this._userInfos = null;
    }

    // Inherited

    async connectedCallback() {
        Session.shareSessionData(this);
        addEventListener('user-updated', GCHamburguer._onUserUpdated);

        // Sim, é acho meio gambiárrico usar uma promise de espera para dar tempo de renderizar todo o documento.
        // Essa foi uma solução rápida que encontrei e que deve ser corrigida no futuro.
        await asyncTimeout(250);

        this._setAttributes();
        this.build();
    }

    async disconnectedCallback() {
        removeEventListener('user-updated', GCHamburguer._onUserUpdated);
    }

    attributeChangedCallback(name) {
        if (name !== 'target') return;
        if (this._target) this._target.innerHTML = '';

        this.setAttribute('aria-controls', this._target?.id);
        this._setupTarget();
    }
    
    // Build

    async build() {
        this.shadowRoot.innerHTML = '';

        this.shadowRoot.appendChild(this._styles);
        this.shadowRoot.appendChild(this._html);
        
        this._setupTarget();
        this._addEvents();
    }

    _setAttributes() {
        this.setAttribute('title', 'Abrir menu');
        this.setAttribute('role', 'button');
        this.setAttribute('aria-expanded', this.open);
        this.setAttribute('aria-controls', this._target?.id);
        this.setAttribute('aria-label', 'Abrir menu');
    }

    get _html() {
        const icon = this.open ? GCHamburguer._openIcon : GCHamburguer._closedIcon;
        return HTMLParser.parse(`<span id="hamburguer-icon">${icon}<span>`);
    }

    get _styles() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }

    _addEvents() {
        if (!this._target) throw new Error('target is not defined');

        this.addEventListener('click', () => {
            this.open = !this.open;
            this._target.classList.toggle('open');

            // Aqui eu poderia transformar hamburguer icon em um getter que sempre retorna o hamburguer icon
            // como padrão de projeto eu poderia sempre criar getters para sub-elementos que são chave no componente.
            const hamburguerIcon = this.shadowRoot.querySelector('#hamburguer-icon');
            hamburguerIcon.textContent = this.open ? GCHamburguer._openIcon : GCHamburguer._closedIcon;

            this._setAttributes();
            this._setTargetAttributes();
        });
    }

    _setupTarget() {
        this._setTargetAttributes();

        if (this._target?.innerHTML) this._target.innerHTML = '';

        this._targetHTML.forEach(tag => this._target?.appendChild?.(tag));
        this._addButtonsEvents();
    }

    _setTargetAttributes() {
        this._target?.setAttribute?.('role', 'menu');
        this._target?.setAttribute?.('aria-hidden', !this.open);
    }

    get _targetHTML() {
        const nickname = this._userInfos && (this._userInfos?.nickname || 'User');
        let picture = this._userInfos ? this._userInfos?.profile_picture : '';

        if (picture && !picture.startsWith('https')) {
            // Caso a URL não esteja completa, joga ela para o domínio da GladCode V2.
            picture = `https://gladcode.dev/${picture}`;
        }

        return HTMLParser.parseAll(`
            <section class='menu-ui-container__user-session'>
                ${this._userLogged
                    ? `
                        <div class='user-session__user'>
                            <a class="user__user-settings" href="#" role="button" aria-label="configurações do usuário">
                                <div class='user-settings__picture'>
                                    <img src="${picture}" alt="">
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
        `);
    }

    _addButtonsEvents() {
        const loginBtn = this._target?.querySelector?.('.login-button') ?? null;
        const logoutBtn = this._target?.querySelector?.('.logout-button') ?? null;

        loginBtn?.removeEventListener('click', Session.userLogin);
        logoutBtn?.removeEventListener('click', Session.userLogout);

        if (!this._userLogged && loginBtn) {
            loginBtn.addEventListener('click', Session.userLogin);
            return;
        }

        if (this._userLogged && logoutBtn) {
            logoutBtn.addEventListener('click', Session.userLogout);
            return;
        }
    }

    // Methods
    
    get _target() {
        let targetStarted = false;

        const targetId = this.getAttribute('target');
        const target = this._root.getElementById(targetId);

        if (!target) return null;

        if (targetStarted && target.childNodes.length <= 0)
            throw new Error('target must be an empty tag element');
        
        targetStarted = true;
        return target;
    }

    _findParentShadowRoot() {
        let parent = this.parentNode;
        while (parent) {
            if (parent instanceof ShadowRoot) return parent;

            parent = parent.parentNode || parent.host;
        }
        return null;
    }
}

customElements.define('gc-hamburguer', GCHamburguer);
export default GCHamburguer;
