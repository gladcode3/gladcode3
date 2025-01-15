import HTMLParser from '../helpers/html-parser.js';
import stylesRaw from '../../less/components/_nav.less?raw';

// <gc-nav></gc-nav>

class GladcodeNavBar extends HTMLElement {
    constructor() {
        super();
        this.role='navigation';
        this.setAttribute('role', 'navigation');
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.#styles());
        this.shadowRoot.appendChild(this.#nav());
    }

    #generateItemRaw({ name, href='#', title }) {
        return `
            <li class="page-links__link">
                <a href="${href}" title="${title}">${name}</a>
            </li>
        `;
    }

    #nav() {
        return HTMLParser.parse(`
            <ul id="page-links">
                ${this.#generateItemRaw({
                    name: 'Aprender',
                    title: 'Entenda como funciona a gladCode',
                })}
                ${this.#generateItemRaw({
                    name: 'Editor',
                    title: 'Crie e programe seus gladiadores',
                })}
                <li role="menu" aria-expanded="false" class="page-links__link page-links__link--drop">
                    <a href="#">Sobre</a>

                    <ul aria-hidden="true" class="link--drop__sub-links">
                        ${this.#generateItemRaw({
                            name: 'O Projeto',
                            title: 'Saiba sobre a trajetória da gladCode',
                        })}
                        ${this.#generateItemRaw({
                            name: 'Apoie a GladCode',
                            title: 'Maneiras de você apoiar o projeto',
                        })}
                        ${this.#generateItemRaw({
                            name: 'Créditos',
                            title: 'Créditos aos criadores das artes e sons utilizados na gladCode',
                        })}
                        ${this.#generateItemRaw({
                            name: 'Estatísticas',
                            title: 'Estatísticas sobre as batalhas realizadas',
                        })}
                    </ul>
                </li>
            </ul>
        `);
    }

    #styles() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }
}

customElements.define('gc-nav', GladcodeNavBar);
export default GladcodeNavBar;
