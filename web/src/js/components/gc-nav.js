import HTMLParser from '../helpers/html-parser.js';
import stylesRaw from '../../less/components/_nav.less?raw';

const kGenerateItemRaw = Symbol('kGenerateItemRaw');
const kNav = Symbol('kNav');
const kStyles = Symbol('kStyles');
const kObserveAriaAttributes = Symbol('kObserveAriaAttributes');

// <gc-nav></gc-nav>

class GladcodeNavBar extends HTMLElement {
    constructor() {
        super();
        this.role='navigation';
        this.setAttribute('role', 'navigation');
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this[kStyles]());
        this.shadowRoot.appendChild(this[kNav]());
        this[kObserveAriaAttributes]();
    }

    [kObserveAriaAttributes]() {
        const dropMenus = this.shadowRoot
            .querySelectorAll('li.page-links__link--drop');

        dropMenus.forEach(menu => {
            const internalUL = menu.querySelector('.link--drop__sub-links');

            menu.addEventListener('mouseenter', () => {
                // aria-expanded="true"
                // aria-hidden="false"
                menu.setAttribute('aria-expanded', 'true');
                internalUL.setAttribute('aria-hidden', 'false');
            });

            menu.addEventListener('mouseleave', () => {
                // aria-expanded="false"
                // aria-hidden="true"
                menu.setAttribute('aria-expanded', 'false');
                internalUL.setAttribute('aria-hidden', 'true');
            });
        });
    }

    [kGenerateItemRaw]({ name, href='#', title }) {
        return `
            <li class="page-links__link">
                <a target="_blank" href="${href}" title="${title}">${name}</a>
            </li>
        `;
    }

    [kNav]() {
        return HTMLParser.parse(`
            <ul id="page-links">
                ${this[kGenerateItemRaw]({
                    name: 'Aprender',
                    title: 'Entenda como funciona a gladCode',
                })}
                ${this[kGenerateItemRaw]({
                    name: 'Editor',
                    title: 'Crie e programe seus gladiadores',
                })}
                <li role="menu" aria-expanded="false" class="page-links__link page-links__link--drop">
                    <a href="#">Sobre</a>

                    <ul aria-hidden="true" class="link--drop__sub-links">
                        ${this[kGenerateItemRaw]({
                            name: 'O Projeto',
                            title: 'Saiba sobre a trajetória da gladCode',
                            href: 'https://gladcode.dev/about'
                        })}
                        ${this[kGenerateItemRaw]({
                            name: 'Apoie a GladCode',
                            title: 'Maneiras de você apoiar o projeto',
                            href: 'https://gladcode.dev/about#support'
                        })}
                        ${this[kGenerateItemRaw]({
                            name: 'Créditos',
                            title: 'Créditos aos criadores das artes e sons utilizados na gladCode',
                            href: 'https://gladcode.dev/creditos'
                        })}
                        ${this[kGenerateItemRaw]({
                            name: 'Estatísticas',
                            title: 'Estatísticas sobre as batalhas realizadas',
                            href: 'https://gladcode.dev/stats'
                        })}
                    </ul>
                </li>
            </ul>
        `);
    }

    [kStyles]() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }
}

customElements.define('gc-nav', GladcodeNavBar);
export default GladcodeNavBar;
