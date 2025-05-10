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
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            });
        }

        await asyncTimeout(50);

        try {
            this.build();
            this._setAttributes();

            this._hideTarget();

            this.addEventListener('click', this.toggle);
        } catch (e) {
            console.error('Falha ao criar menu:', e);
            throw new Error('Falha ao criar menu', e);
        }
    }

    build() {
        this.shadowRoot.appendChild(this._styles);
        this.shadowRoot.appendChild(this._html);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.toggle);
    }

    attributeChangedCallback(name) {
        if (name !== 'target' && name !== 'ignoreContext') return;

        try {
            const targetElement = this.target;
            if (targetElement) {
                this.setAttribute('aria-controls', targetElement.id);

                if (this.isConnected) {
                    if (this.open) {
                        this._showTarget();
                    } else {
                        this._hideTarget();
                    }
                }
            }
        } catch (e) {
            console.error('Falha ao mudar target:', e);
            throw new Error('Falha ao mudar target', e);
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
            console.error('Erro ao mostrar target:', e);
        }
    }

    _hideTarget() {
        try {
            const targetElement = this.target;
            if (!targetElement) return;
            
            targetElement.classList.add('hidden');
            targetElement.style.display = 'none';
        } catch (e) {
            console.error('Erro ao esconder target:', e);
        }
    }

    toggle() {
        this.open = !this.open;

        if (this.open) {
            this._showTarget();
        } else {
            this._hideTarget();
        }

        this._renderMenu();
    }

    get iconSpan() {
        const icon = this.shadowRoot.getElementById('hamburguer-icon');
        if (!icon) throw new Error('#hamburguer-icon não encontrado');

        return icon;
    }

    /**
     * Encontra o elemento root adequado com base no contexto
     * @returns {Element|ShadowRoot|Document} Elemento root para buscar o target
     */
    _findRoot() {
        // Se não deve ignorar o contexto, usar o elemento pai mais próximo
        if (!this.hasAttribute('ignoreContext')) {
            // Verificar se estamos dentro de um componente (ShadowDOM)
            let parent = this.parentNode;
            
            // Se estivermos dentro de um shadowRoot, use-o como contexto
            if (parent instanceof ShadowRoot) {
                return parent;
            }
            
            // Buscar até encontrar um host de shadowRoot (se existir algum)
            while (parent && !(parent instanceof ShadowRoot) && parent.parentNode) {
                parent = parent.parentNode;
            }
            
            // Se encontramos um shadowRoot, use-o como contexto
            if (parent instanceof ShadowRoot) {
                return parent;
            }
            
            // Caso contrário, use o documento normal
            return document;
        } else {
            // Se deve ignorar o contexto, retornamos null para fazer busca especial
            return null;
        }
    }

    /**
     * Busca um elemento pelo ID atravessando ShadowDOMs quando ignoreContext é true
     * @param {string} id - ID do elemento a ser encontrado
     * @returns {Element|null} - Elemento encontrado ou null
     */
    _findElementAcrossShadows(id) {
        // Primeiro tenta no documento principal
        let element = document.getElementById(id);
        if (element) return element;
        
        // Função recursiva para buscar em todos os shadow roots
        const searchInShadows = (root) => {
            if (!root) return null;
            
            // Verificar no shadow root atual
            const element = root.getElementById(id);
            if (element) return element;
            
            // Buscar em todos os elementos com shadow root
            const elementsWithShadow = Array.from(root.querySelectorAll('*'))
                .filter(el => el.shadowRoot);
            
            for (const el of elementsWithShadow) {
                const found = searchInShadows(el.shadowRoot);
                if (found) return found;
            }
            
            return null;
        };
        
        // Buscar em todos os shadow roots no documento
        const allShadowHosts = Array.from(document.querySelectorAll('*'))
            .filter(el => el.shadowRoot);
        
        for (const host of allShadowHosts) {
            const found = searchInShadows(host.shadowRoot);
            if (found) return found;
        }
        
        return null;
    }

    get target() {
        const targetId = this.getAttribute('target');
        if (!targetId) {
            console.warn('HamburguerMenu: Atributo "target" não definido');
            return null;
        }

        let targetElement = null;
        
        if (this.hasAttribute('ignoreContext')) {
            // Modo de busca que atravessa ShadowDOMs
            targetElement = this._findElementAcrossShadows(targetId);
        } else {
            // Busca baseada no contexto apropriado
            const root = this._findRoot();
            targetElement = root.getElementById(targetId);
        }

        if (!targetElement) {
            console.warn(`Target com ID "${targetId}" não encontrado no contexto`);
            return null;
        }

        return targetElement;
    }
}

customElements.define('hamburguer-menu', HamburguerMenu);
export default HamburguerMenu;
