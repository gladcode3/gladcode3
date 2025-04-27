import HTMLParser from "../helpers/html-parser.js";
import stylesRaw from '../../less/components/_loader-menu.less?raw';


// <loader-menu></loader-menu>

class LoaderMenu extends HTMLElement {
    static _storageKey = 'last-panel-selected';

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });  
        
        this._setuped = false;
        this._loadedRaws = {};
        this._itemsPaths = {};
        this._itemsActions = {};
        this.displayTarget = null;
        this.defaultItem = null;
        this.items = [];
        this.selectedItem = null;
    }

    async connectedCallback() {
        if (!this._setuped) {
            console.error('loader-menu is not setuped');
            throw new Error('loader-menu is not setuped');
        }

        this._setRole();

        this.shadowRoot.appendChild(this._styles());
        this.shadowRoot.appendChild(this._loaderMenu());

        const eventsTask = async () => this._addItemsEvents();

        const renderFirstItemTask = async () => {
            this._updateSelected();
            await this._loadHTML();
            await this._executeAction();
        };

        await Promise.all([
            eventsTask(),
            renderFirstItemTask()
        ]);
    }

    setup({ target, default: defaultItem, items }) {
        this._setuped = true;

        this.displayTarget = document.querySelector(target);

        this.items = items;
        this._verifyRepeatedItems();

        this.defaultItem = defaultItem || this.items[0];
        this._verifyDefaultItem();

        this.selectedItem = sessionStorage.getItem(LoaderMenu._storageKey) || this.defaultItem;

        // Maps
        this._loadedRaws = this.items.reduce((raws, { id }) => {
            raws[id] = null;
            return raws;
        }, {});

        this._itemsPaths = this.items.reduce((paths, { id, path }) => {
            paths[id] = path;
            return paths;
        }, {});

        this._itemsActions = this.items.reduce((actions, { id, action }) => {
            actions[id] = action;
            return actions;
        }, {});
    }

    _setRole() {
        this.role = 'navigation';
        this.setAttribute('role', 'navigation');
    }

    _addItemsEvents() {
        const items = this.shadowRoot.querySelectorAll('.items-list__item');

        items.forEach(itemEl => {
            const { id: itemId } = this.items
                .find(item => item.id === itemEl.id);

            itemEl.addEventListener('click', async () => {
                this.selectedItem = itemId;
                this._updateSelected();
                await this._loadHTML();
                await this._executeAction();
            });
        });
    }

    _updateSelected() {
        sessionStorage.setItem(LoaderMenu._storageKey, this.selectedItem);        
        this._updateItemBackground();
    }

    // Main:
    async _loadHTML(item_id) {
        const itemKey = item_id || this.selectedItem;

        if (this._loadedRaws[itemKey]) {
            this.displayTarget.innerHTML = this._loadedRaws[itemKey];
            return;
        }
        
        if (!this._itemsPaths?.[itemKey]) return;

        try {
            const res = await fetch(this._itemsPaths[itemKey]);
            const loadedHTMLRaw = await res.text();
    
            this._loadedRaws[itemKey] = loadedHTMLRaw;
            this.displayTarget.innerHTML = loadedHTMLRaw;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async _executeAction(item_id) {
        const itemKey = item_id || this.selectedItem;
        await this._itemsActions[itemKey]?.();
    }
    
    // Validation: 
    _verifyRepeatedItems() {
        const ids = [];

        this.items.forEach(({ id }) => {
            if (ids.includes(id)) {
                console.error(`items cannot contain duplicate ids. Duplicated: ${id}`);
                throw new ReferenceError(`items cannot contain duplicate ids. Duplicated: ${id}`);
            }
            
            ids.push(id);
        });
    }

    _verifyDefaultItem() {
        const defaultItemIsInItems = this.items.some(({ id }) => id === this.defaultItem);

        if (!defaultItemIsInItems) {
            console.error(`${this.defaultItem} is not in items`);
            throw new ReferenceError(`${this.defaultItem} is not in items`);
        }
    }

    // Interface:
    _updateItemBackground(item) {
        const items = this.shadowRoot.querySelectorAll('.items-list__item');
        const itemEl = item || this.shadowRoot.querySelector(`.items-list__item.${this.selectedItem}`);

        items.forEach(item => {
            item.classList
                .remove('items-list__item--selected');
        });

        itemEl.classList.add('items-list__item--selected');
    }

    _getItemRaw({ id, label, faIcon = '', notify = true }) {
        return `
            <li role="tab" id="${id}" class='items-list__item ${id}' tabindex="0">
                ${notify
                    ? '<span class="item__notify item__notify--empty"></span>'
                    : ''
                }
        
                <div class='item__frame'>
                    <i class="fa-solid ${faIcon}"></i>
                </div>
        
                <span>${label}</span>
            </li>
        `;
    }

    _loaderMenu() {
        let itemsRaw = '';

        this.items.forEach(({ id, label, faIcon, notify }) => {
            itemsRaw += this._getItemRaw({ id, label, faIcon, notify });
        });

        return HTMLParser.parse(`<ul role="tablist" id="items-list">${itemsRaw}</ul>`);
    }

    _styles() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }
}

customElements.define('loader-menu', LoaderMenu);
export default LoaderMenu;
