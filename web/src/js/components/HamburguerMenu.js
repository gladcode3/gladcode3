import '../../less/components/_hamburguer.less';
import stylesRaw from '../../less/components/_hamburguer.less?raw';

import asyncTimeout from '../helpers/asyncTimeout.js';
import HTMLParser from '../helpers/HTMLParser.js';

// <hamburguer-menu target="my-target-id" [ignoreContext]>
class HamburguerMenu extends HTMLElement {
    static observedAttributes = [ 'target', 'ignoreContext' ];

    static _ICON_CLOSE = '✕';
    static _ICON_OPEN = '☰';

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.open = false;
        this.toggle = this.toggle.bind(this);
    }

    async connectedCallback() {
        await this.waitDOMToLoad();

        try {
            this.build();
            this._setAttributes();

            // Alvo fica escondido por padrão.
            this._hideTarget();

            this.addEventListener('click', this.toggle);
        } catch (e) {
            throw new Error('failed to create menu', e);
        }
    }

    async waitDOMToLoad() {
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            });
        }

        await asyncTimeout(50);
    }

    build() {
        this.shadowRoot.appendChild(this._styles);
        this.shadowRoot.appendChild(this._html);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.toggle);
    }

    attributeChangedCallback(name) {
        if (!HamburguerMenu.observedAttributes.includes(name)) return;

        try {
            const targetElement = this.target;
            if (!targetElement) return;

            this.setAttribute('aria-controls', targetElement.id);

            if (this.isConnected && this.open) this._showTarget();
            if (this.isConnected && !this.open) this._hideTarget();
        } catch (e) {
            throw new Error('failed to change target', e);
        }
    }

    _setAttributes() {
        this.setAttribute('role', 'button');
        this.setAttribute('aria-expanded', this.open ? 'true' : 'false');
        this.setAttribute('tabindex', '0');
    }

    get _html() {
        return HTMLParser
            .parse(`<span id="hamburguer-icon">${HamburguerMenu._ICON_OPEN}</span>`);
    }

    get _styles() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }

    _renderMenu() {
        const icon = this.open
            ? HamburguerMenu._ICON_CLOSE
            : HamburguerMenu._ICON_OPEN;

        this.iconSpan.textContent = icon;
        this.setAttribute('aria-expanded', this.open ? 'true' : 'false');
    }

    _showTarget() {
        try {
            const targetElement = this.target;
            if (!targetElement) return;

            targetElement.classList.remove('hidden');
            targetElement.style.display = '';
        } catch (e) {
            throw new Error('error to show target', e);
        }
    }

    _hideTarget() {
        try {
            const targetElement = this.target;
            if (!targetElement) return;
            
            targetElement.classList.add('hidden');
            targetElement.style.display = 'none';
        } catch (e) {
            throw new Error('error to hide target', e);
        }
    }

    toggle() {
        this.open = !this.open;

        if (this.open) this._showTarget();
        if (!this.open) this._hideTarget();

        this._renderMenu();
    }

    get iconSpan() {
        const icon = this.shadowRoot.getElementById('hamburguer-icon');
        if (!icon) throw new Error('"span#hamburguer-icon" not found');

        return icon;
    }

    _findRoot() {
        if (this.hasAttribute('ignoreContext')) return null;

        let parent = this.parentNode;

        if (parent instanceof ShadowRoot) return parent;
            
        // Repete ate não haver mais pais ou até encontrar um pai que seja ShadowRoot
        while (true) {
            if (!parent) break;
            if (!parent.parentNode) break;
            if (parent instanceof ShadowRoot) break;

            parent = parent.parentNode;
        }
            
        if (parent instanceof ShadowRoot) return parent;

        return document;
    }

    // Busca um elemento por ID atravessando ShadowDOMs quando ignoreContext é true
    _findElementAcrossShadows(id) {
        if (!this.hasAttribute('ignoreContext')) return null;

        let element = document.getElementById(id);
        if (element) return element;
        
        const searchInShadows = root => {
            if (!root) return null;
            
            const element = root.getElementById(id);
            if (element) return element;
            
            const childsWithShadow = Array.from(root.querySelectorAll('*'))
                .filter(child => child.shadowRoot);
            
            for (const child of childsWithShadow) {
                const found = searchInShadows(child.shadowRoot);
                if (found) return found;
            }
            
            return null;
        };
        
        const allShadowHosts = Array.from(document.querySelectorAll('*'))
            .filter(element => element.shadowRoot);
        
        for (const host of allShadowHosts) {
            const found = searchInShadows(host.shadowRoot);
            if (found) return found;
        }
        
        return null;
    }

    get target() {
        const targetId = this.getAttribute('target');

        if (!targetId) {
            console.warn('"target" attribute is not defined');
            return null;
        }

        let targetElement = null;
        
        const findTargetMap = {
            'true': () => this._findElementAcrossShadows(targetId),
            'false': () => this._findRoot().getElementById(targetId)
        };

        const key = this.hasAttribute('ignoreContext') ? 'true' : 'false';
        targetElement = findTargetMap[key]();

        if (!targetElement) {
            console.warn(`no target with id ${targetId} was found`);
            return null;
        }

        return targetElement;
    }
}

customElements.define('hamburguer-menu', HamburguerMenu);
export default HamburguerMenu;
