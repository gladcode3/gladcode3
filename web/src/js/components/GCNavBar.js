import HTMLParser from '../helpers/HTMLParser.js';
import stylesRaw from '../../less/components/_nav.less?raw';


// <gc-nav></gc-nav>

class GCNavBar extends HTMLElement {
    // Observed attributes for changes.
    static observedAttributes = ['direction'];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._navPointer = null;
        this._direction = this._syncDirection;
    }

    // Inherited Methods:

    connectedCallback() {
        this._setAttributes();

        this.shadowRoot.appendChild(this._styles);

        const nav = this._html;
        this.shadowRoot.appendChild(nav);

        this._addEvents();

        this._navPointer = nav;
    }

    attributeChangedCallback(name) {
        if (name !== 'direction') return;
        this._direction = this._syncDirection;
        this._rebuild();
    }

    // Build

    _setAttributes() {
        this.setAttribute('role', 'navigation');
    }

    get _styles() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }

    get _html() {
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
            <ul role="menu" id="page-links">
                ${this._generateItemRaw({
                    name: 'Aprender',
                    title: 'Entenda como funciona a gladCode',
                })}
                ${this._generateItemRaw({
                    name: 'Editor',
                    title: 'Crie e programe seus gladiadores',
                })}
                ${this._generateDropableItemRaw('Sobre', aboutSublinks)}
            </ul>
        `);
    }

    _addEvents() {
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

    // Methods:

    get _syncDirection() {
        const direction = this.getAttribute('direction') || 'row';
        return (['row', 'column'].includes(direction)) ? direction : 'row';
    }

    _rebuild() {
        if (this._navPointer) this._navPointer.remove();

        const content = this._html;
        this.shadowRoot.appendChild(content);

        this._navPointer = content;
    }

    _generateItemRaw({ name, href='#', title }) {
        return `
            <li role="menuitem" class="page-links__link">
                <a target="_blank" href="${href}" title="${title}">${name}</a>
            </li>
        `;
    }

    _generateDropableItemRaw(name, sublinks_config = []) {
        const sublinksRaw = sublinks_config
            .map(sublink => this._generateItemRaw(sublink))
            .join('');
        
        const ulTag = `
            <ul
                role="menu"
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

        return `
            <li
                role="menuitem"
                aria-expanded="false"
                class="page-links__link page-links__link--drop"
            >${direcionsMap[this._direction]}</li>
        `;
    }
}

customElements.define('gc-nav', GCNavBar);
export default GCNavBar;
