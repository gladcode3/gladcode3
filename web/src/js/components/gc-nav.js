import HTMLParser from '../helpers/html-parser.js';
import stylesRaw from '../../less/components/_nav.less?raw';

const kDirection = Symbol('kDirection');
const kSyncDirection = Symbol('kSyncDirection');
const kNavPointer = Symbol('kNavPointer');
const kBuildNav = Symbol('kBuildNav');
const kSetRole = Symbol('kSetRole');
const kGenerateItemRaw = Symbol('kGenerateItemRaw');
const kNav = Symbol('kNav');
const kStyles = Symbol('kStyles');
const kObserveAriaAttributes = Symbol('kObserveAriaAttributes');
const kGenerateDropableItemRaw = Symbol('kGerenateDropableItemRaw');

// <gc-nav></gc-nav>

class GladcodeNavBar extends HTMLElement {
    // Observed attributes for changes.
    static observedAttributes = ['direction'];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this[kNavPointer] = null;
        this[kDirection] = this[kSyncDirection]();
    }
    
    [kSetRole]() {
        this.role='navigation';
        this.setAttribute('role', 'navigation');
    }

    // Inherited Methods:

    connectedCallback() {
        this[kSetRole]();

        this.shadowRoot.appendChild(this[kStyles]());

        this[kBuildNav]();
        this[kObserveAriaAttributes]();
    }

    attributeChangedCallback(name) {
        if (name !== 'direction') return;
        this[kDirection] = this[kSyncDirection]();
        this[kBuildNav]();
    }

    // Building:

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

    [kBuildNav]() {
        if (this[kNavPointer]) this[kNavPointer].remove();

        this[kNavPointer] = this[kNav]();
        this.shadowRoot.appendChild(this[kNavPointer]);
    }

    [kNav]() {
        const aboutSublinks = [
            {
                name: 'O Projeto',
                title: 'Saiba sobre a trajetória da gladCode',
                href: 'https://gladcode.dev/about'
            },
            {
                name: 'Apoie a GladCode',
                title: 'Maneiras de você apoiar o projeto',
                href: 'https://gladcode.dev/about#support'
            },
            {
                name: 'Créditos',
                title: 'Créditos aos criadores das artes e sons utilizados na gladCode',
                href: 'https://gladcode.dev/creditos'
            },
            {
                name: 'Estatísticas',
                title: 'Estatísticas sobre as batalhas realizadas',
                href: 'https://gladcode.dev/stats'
            }
        ];

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
                ${this[kGenerateDropableItemRaw]('Sobre', aboutSublinks)}
            </ul>
        `);
    }

    [kStyles]() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }

    // Methods:

    [kGenerateDropableItemRaw](name, sublinks_config = []) {
        const sublinksRaw = sublinks_config
            .map(sublink => this[kGenerateItemRaw](sublink))
            .join('');
        
        const ulTag = `
            <ul
                aria-hidden='true'
                class='link--drop__sub-links'
            >${sublinksRaw}</ul>
        `;

        const direcionsMap = {
            'row': `
                <a href="#">${name}</a>
                ${ulTag}
            `,
            'column': `
                <details open>
                    <summary>${name}</summary>
                    ${ulTag}
                </details>
            `
        };

        console.warn('esperado: COLUMN, recebido: ', this[kDirection]);
        return `
            <li
                role="menu"
                aria-expanded="false"
                class="page-links__link page-links__link--drop"
            >${direcionsMap[this[kDirection]]}</li>
        `;
    }

    [kGenerateItemRaw]({ name, href='#', title }) {
        return `
            <li class="page-links__link">
                <a target="_blank" href="${href}" title="${title}">${name}</a>
            </li>
        `;
    }

    [kSyncDirection]() {
        const direction = this.getAttribute('direction') || 'row';
        return (['row', 'column'].includes(direction)) ? direction : 'row';
    }
}

customElements.define('gc-nav', GladcodeNavBar);
export default GladcodeNavBar;
