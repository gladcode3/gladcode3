import HTMLParser from "../helpers/html-parser.js";
import timeout from "../helpers/timeout.js";
import Session from "../model/session.js";

import stylesRaw from '../../less/components/_hamburguer.less?raw';


// <gc-hamburguer target=''></gc-hamburguer>

class GCHamburguer extends HTMLElement {
    static observedAttributes = ['target'];

    static _closedIcon = '☰';
    static _openIcon = '✕';

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._root = this._findParentShadowRoot() || document;

        this._open = false;
        this._target = null;
        this._targetStarted = false;

        this._userLogged = null;
        this._userInfos = null;
    }

    // Inherited

    async connectedCallback() {
        // Compartilha as informações da sessão com a instância
        Session.shareSessionData(this);

        // Sincroniza o target

        // Sim, também acho meio gambiárrico usar uma promise de espera para dar tempo dele renderizar os outros elementos no documento.
        // Essa foi uma solução rápida que encontrei e que deve ser corrigida no futuro
        await timeout(250); 
        
        this._target = this._syncTarget;
    
        this._setAttributes();
    
        this.shadowRoot.appendChild(this._styles);
        this.shadowRoot.appendChild(this._html);
        
        this._setupTarget();
        
        this._addEvents();
    }

    attributeChangedCallback(name) {
        if (name !== 'target') return;
        if (this._target) this._target.innerHTML = '';

        this._target = this._syncTarget;
        this.setAttribute('aria-controls', this._target?.id);
        this._setupTarget();
    }

    // Build

    _setAttributes() {
        this.setAttribute('title', 'Abrir menu');
        this.setAttribute('role', 'button');
        this.setAttribute('aria-expanded', this._open);
        this.setAttribute('aria-controls', this._target?.id);
        this.setAttribute('aria-label', 'Abrir menu');
    }

    get _html() {
        const icon = this._open ? GCHamburguer._openIcon : GCHamburguer._closedIcon;
        return HTMLParser.parse(`<span id="hamburguer-icon">${icon}<span>`);
    }

    get _styles() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }

    _addEvents() {
        if (!this._target) throw new Error('target is not defined');

        this.addEventListener('click', () => {
            this._open = !this._open;

            // console.warn('GCHamburguer._target', this._target);
            this._target.classList.toggle('open');

            const hamburguerIcon = this.shadowRoot.querySelector('#hamburguer-icon');
            hamburguerIcon.textContent = this._open ? GCHamburguer._openIcon : GCHamburguer._closedIcon;

            this._setAttributes();
            this._setTargetAttributes();
        });
    }

    _setupTarget() {
        this._setTargetAttributes();
        this._targetHTML.forEach(tag => this._target?.appendChild?.(tag));
        this._addButtonsEvents();
    }

    _setTargetAttributes() {
        this._target?.setAttribute?.('role', 'menu');
        this._target?.setAttribute?.('aria-hidden', !this._open);
    }

    get _targetHTML() {
        const nickname = this._userInfos && (this._userInfos?.nickname || 'User');
        const picture = this._userInfos
            ? this._userInfos?.profile_picture
            : './img/profile-photo-support.jpg';

        return HTMLParser.parseAll(`
            <section class='menu-ui-container__user-session'>
                ${this._userLogged
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
        `);
    }

    _addButtonsEvents() {
        const loginBtn = this._target?.querySelector?.('.login-button');
        const logoutBtn = this._target?.querySelector?.('.logout-button');

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
    
    get _syncTarget() {
        this._targetStarted = false;

        const targetId = this.getAttribute('target');

        // console.log('targetId: ', targetId);
        const target = this._root.getElementById(targetId);
        // console.log('_root: ', this._root.childNodes.length);
        // console.log('target: ', target);

        // if (!target) throw new Error('target not founded');
        if (!target) return null;

        
        // console.log(target.childNodes.length);
        if (this._targetStarted && target.childNodes.length <= 0)
            throw new Error('target must be an empty tag element');
        
        this._targetStarted = true;
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
