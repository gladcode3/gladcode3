import Users from "../model/users.js";
import HTMLParser from "../helpers/html-parser.js";
import Session from "../model/session.js";

import stylesRaw from '../../less/components/_user-infos.less?raw';


// <gc-user-infos>

class GCUserInfos extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._userInfos = null;

        this._pictureElement = null;
        this._nicknameElement = null;
        this._lvlElement = null;
        this._coinsElement = null;
        this._xpElement = null;
    }

    // Inherited

    connectedCallback() {
        addEventListener('user-updated', () => {
            console.warn(`Dados antigos:`, this._userInfos);
            Session.shareSessionData(this);
            console.warn(`Dados novos:`, this._userInfos);
            this.setup(this._userInfos);
        });

        Session.shareSessionData(this);

        this._setAttributes();

        this.shadowRoot.appendChild(this._styles);
        this._html.forEach(tag => this.shadowRoot.appendChild(tag));

        this.setup(this._userInfos);
    }

    // Build

    _setAttributes() {
        this.setAttribute('role', 'region');
        this.setAttribute('aria-label', 'informações do usuário')
    }

    get _styles() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }

    get _html() {
        return HTMLParser.parseAll(`
            <div id="main-infos">
                <div class="main-infos__picture">
                    <img aria-label="foto de perfil" src="/img/profile-photo-support.jpg" alt="">
                </div>

                <span class="main-infos__nickname">USER</span>

                <div aria-label="nível de experiência" class="main-infos__xp-lvl">
                    <div title="Nível" aria-label="nível" class='xp-lvl__lvl'>
                        <img src='/img/star-icon.svg' alt="">
                        <span class="lvl__lvl">0</span>
                    </div>

                    <progress title="Pontos de XP" aria-label="pontos de xp" class="xp-lvl__xp" value="50" max="100"></progress>
                </div>
            </div>

            <div id="money-infos" aria-label="quantidade de pratas" title="Pratas">
                <i class="fa-solid fa-coins"></i>
                <span class='money-infos__coins'>0</span>
            </div>
        `);
    }

    // Methods

    setup({ profile_picture = null, nickname='USER', lvl=0, silver=0, xp=0 } = {}) {
        this._findElements();

        if (profile_picture) {
            const pictureURL = `https://gladcode.dev/${profile_picture}`
            this._pictureElement.src = pictureURL;
        }
        
        this._nicknameElement.textContent = nickname;
        this._lvlElement.textContent = lvl;
        this._coinsElement.textContent = silver;
        
        this._xpElement.setAttribute('value', xp);
        this._xpElement.setAttribute('max', Users.calcXpToNextLvl({ lvl }));
    }

    _findElements() {
        this._pictureElement = this.shadowRoot.querySelector('#main-infos img');
        this._nicknameElement = this.shadowRoot.querySelector('#main-infos .main-infos__nickname');
        this._lvlElement = this.shadowRoot.querySelector('#main-infos .lvl__lvl');
        this._coinsElement = this.shadowRoot.querySelector('#money-infos .money-infos__coins');
        this._xpElement = this.shadowRoot.querySelector('.xp-lvl__xp');
    }
}

customElements.define('gc-user-infos', GCUserInfos);
export default GCUserInfos;
