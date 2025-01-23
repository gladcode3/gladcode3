import Users from "../model/users.js";
import HTMLParser from "../helpers/html-parser.js";

import stylesRaw from '../../less/components/_user-infos.less?raw';

const kUser = Symbol('kUser');
const kPictureElement = Symbol('kPictureElement');
const kNicknameElement = Symbol('kNicknameElement');
const kLevelElement = Symbol('kLevelElement');
const kCoinsElement = Symbol('kCoinsElement');
const kXpElement = Symbol('kXpElement');
const kFindElements = Symbol('kFindElements');
const kSetRole = Symbol('kSetRole');
const kUserInfos = Symbol('kUserInfos');
const kStyles = Symbol('kStyles');

// <gc-user-infos>

class GladcodeUserInfos extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this[kUser] = null;
        this[kPictureElement] = null;
        this[kNicknameElement] = null;
        this[kLevelElement] = null;
        this[kCoinsElement] = null;
        this[kXpElement] = null;
    }

    connectedCallback() {
        this[kSetRole]();

        this.shadowRoot.appendChild(this[kStyles]());
        this[kUserInfos]().forEach(html_element => {
            this.shadowRoot.appendChild(html_element);
        });

        this[kFindElements]();

        this[kUser] = Users.getLocalUserData() || null;
        this.setup(this[kUser]);
    }

    setup({ profile_picture = null, nickname='USER', lvl=0, silver=0, xp=0 } = {}) {
        if (profile_picture) {
            const pictureURL = `https://gladcode.dev/${profile_picture}`
            this[kPictureElement].src = pictureURL;
        }
        
        this[kNicknameElement].textContent = nickname;
        this[kLevelElement].textContent = lvl;
        this[kCoinsElement].textContent = silver;
        
        this[kXpElement].setAttribute('value', xp);
        this[kXpElement].setAttribute('max', Users.calcXpToNextLvl({ lvl }));

    }

    [kFindElements]() {
        this[kPictureElement] = this.shadowRoot.querySelector('#main-infos img');
        this[kNicknameElement] = this.shadowRoot.querySelector('#main-infos .main-infos__nickname');
        this[kLevelElement] = this.shadowRoot.querySelector('#main-infos .lvl__lvl');
        this[kCoinsElement] = this.shadowRoot.querySelector('#money-infos .money-infos__coins');
        this[kXpElement] = this.shadowRoot.querySelector('.xp-lvl__xp');
    }

    [kSetRole]() {
        this.role = 'region';
        this.setAttribute('role', 'region');
        this.ariaLabel = 'informações do usuário';
        this.setAttribute('aria-label', 'informações do usuário')
    }

    [kUserInfos]() {
        return HTMLParser.parseAll(`
            <div id="main-infos">
                <div aria-label="foto de perfil" class="main-infos__picture">
                    <img src="/img/profile-photo-support.jpg" alt="">
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

    [kStyles]() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }
}

customElements.define('gc-user-infos', GladcodeUserInfos);

export default GladcodeUserInfos;
