import HTMLParser from '../utils/HTMLParser.js';

const DEFAULT_STYLES = `
:host { display: block; }
.items-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 10px;
}

.items-list__item {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  background: white;
  transition: all 0.2s;
}

.items-list__item:hover {
  background-color: #f0f0f0;
}

.items-list__item--selected {
  background-color: #e0e0e0;
  font-weight: bold;
}

.item__notify {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: transparent;
}

.item__notify--active {
  background-color: #ff4757;
}

.item__frame {
  display: flex;
  align-items: center;
  justify-content: center;
}
`;

class LoaderMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._setuped = false;
        this.items = [];
        this.defaultItem = null;
        this.selectedItem = null;
        this._loadedRaws = {};
        this._itemsPaths = {};
        this._itemsActions = {};
        this.displayTarget = null;
        this._storageKey = null;

        this._config = {
            menuClass: 'items-list',
            itemClass: 'items-list__item',
            selectedClass: 'items-list__item--selected',
            iconClass: 'fa-solid',
            notifyClass: 'item__notify',
            notifyActiveClass: 'item__notify--active',
            frameClass: 'item__frame',
            styles: DEFAULT_STYLES
        };
    }

    async connectedCallback() {
        if (!this._setuped) {
            console.error('loader-menu is not setuped');
            throw new Error('loader-menu is not setuped');
        }

        this._setRole();
        this.shadowRoot.appendChild(this._styles());
        this.shadowRoot.appendChild(this._loaderMenu());

        await Promise.all([
            this._addItemsEvents(),
            this._loadHTML(),
            this._executeAction()
        ]);
    }

    setup({ target, default: defaultItem, items, config = {} }) {
        this._setuped = true;
        this.displayTarget = document.querySelector(target);
        this.items = items;
        this._verifyRepeatedItems();
        this.defaultItem = defaultItem || this.items[0];
        this._verifyDefaultItem();
        
        this._storageKey = config.storageKey || null;
        this.selectedItem = this._storageKey
            ? sessionStorage.getItem(this._storageKey) || this.defaultItem
            : this.defaultItem;

        // Merge de configurações
        this._config = {
            ...this._config,
            ...config,
            styles: `${config.styles || ''}`
        };

        // Inicializa mapeamentos
        this._loadedRaws = this.items.reduce((acc, { id }) => ({ ...acc, [id]: null }), {});
        this._itemsPaths = this.items.reduce((acc, { id, path }) => ({ ...acc, [id]: path }), {});
        this._itemsActions = this.items.reduce((acc, { id, action }) => ({ ...acc, [id]: action }), {});
    }

    // Métodos internos
    _setRole() {
        this.role = 'navigation';
        this.setAttribute('role', 'navigation');
    }

    _getItemRaw({ id, label, faIcon = '', notify = false }) {
        const {
            itemClass,
            iconClass,
            notifyClass,
            notifyActiveClass,
            frameClass
        } = this._config;

        return `
            <li 
                role="tab" 
                id="${id}" 
                class="${itemClass} ${id}" 
                tabindex="0"
                aria-selected="false"
            >
                ${notify ? `
                    <span class="${notifyClass} ${notify ? notifyActiveClass : ''}"></span>
                ` : ''}
                
                <div class="${frameClass}">
                    ${faIcon ? `<i class="${iconClass} ${faIcon}"></i>` : ''}
                </div>
                
                <span>${label}</span>
            </li>
        `;
    }

    _loaderMenu() {
        const { menuClass } = this._config;
        return HTMLParser.parse(`
            <ul class="${menuClass}" role="tablist" id="items-list">
                ${this.items.map(item => this._getItemRaw(item)).join('')}
            </ul>
        `);
    }

    _styles() {
        return HTMLParser.parse(`<style>${this._config.styles}</style>`);
    }

    async _addItemsEvents() {
        const { itemClass } = this._config;
        const items = this.shadowRoot.querySelectorAll(`.${itemClass}`);

        items.forEach(itemEl => {
            itemEl.addEventListener('click', async () => {
                this.selectedItem = itemEl.id;
                this._updateSelected();
                await this._loadHTML();
                await this._executeAction();
            });
        });
    }

    _updateSelected() {
        if (this._storageKey) {
            sessionStorage.setItem(this._storageKey, this.selectedItem);
        }
        this._updateItemSelection();
    }

    _updateItemSelection() {
        const { itemClass, selectedClass } = this._config;
        const items = this.shadowRoot.querySelectorAll(`.${itemClass}`);

        items.forEach(item => {
            const isSelected = item.id === this.selectedItem;
            item.classList.toggle(selectedClass, isSelected);
            item.setAttribute('aria-selected', isSelected.toString());
        });
    }

    async _loadHTML(itemId) {
        const key = itemId || this.selectedItem;
        if (this._loadedRaws[key]) {
            this.displayTarget.innerHTML = this._loadedRaws[key];
            return;
        }

        if (!this._itemsPaths?.[key]) return;

        try {
            const res = await fetch(this._itemsPaths[key]);
            this._loadedRaws[key] = await res.text();
            this.displayTarget.innerHTML = this._loadedRaws[key];
        } catch (err) {
            console.error(`Failed to load ${key}:`, err);
            throw err;
        }
    }

    async _executeAction(itemId) {
        const key = itemId || this.selectedItem;
        try {
            await this._itemsActions[key]?.();
        } catch (err) {
            console.error(`Error executing action for ${key}:`, err);
        }
    }

    // Validações
    _verifyRepeatedItems() {
        const ids = new Set();
        this.items.forEach(({ id }) => {
            if (ids.has(id)) throw new Error(`Duplicate item ID: ${id}`);
            ids.add(id);
        });
    }

    _verifyDefaultItem() {
        if (!this.items.some(item => item.id === this.defaultItem)) {
            throw new Error(`Default item "${this.defaultItem}" not found in items`);
        }
    }
}

customElements.define('loader-menu', LoaderMenu);
export default LoaderMenu;
