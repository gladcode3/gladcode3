import Users from "../model/users.js";
import HTMLParser from "../helpers/html-parser.js";

import stylesRaw from '../../less/components/_user-infos.less?raw';

// <gc-user-infos>

class GladcodeUserInfos extends HTMLElement {
    constructor() {
        super();
        this.role = 'region';
        this.ariaLabel = 'informações do usuário';
        this.setAttribute('role', 'region');
        this.setAttribute('aria-label', 'informações do usuário')
        this.attachShadow({ mode: 'open' });

        this.userInfos = null;
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.#styles());
        this.#userInfos().forEach(html_element => {
            this.shadowRoot.appendChild(html_element);
        });

        this.userInfos = Users.getLocalUserData() || null;
        this.setup(this.userInfos);
    }

    #userInfos() {
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

    #styles() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }

    setup({ profile_picture = null, nickname='user', lvl=0, silver=0 } = {}) {
        if (profile_picture) {
            const pictureField = this.shadowRoot
                .querySelector('#main-infos img');

            pictureField.src = `https://gladcode.dev/${profile_picture}`;
        }

        const nicknameField = this.shadowRoot
            .querySelector('#main-infos .main-infos__nickname');
        
        nicknameField.textContent = nickname;

        const levelField = this.shadowRoot
            .querySelector('#main-infos .lvl__lvl');

        levelField.textContent = lvl;

        const coinsField = this.shadowRoot
            .querySelector('#money-infos .money-infos__coins');

        coinsField.textContent = silver;
    }
}

customElements.define('gc-user-infos', GladcodeUserInfos);

export default GladcodeUserInfos;
