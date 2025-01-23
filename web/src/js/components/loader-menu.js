/*
    LoaderMenu class: Creates a menu capable of rendering HTML and/or triggering functions 
    * @element loader-menu
    * @property {HTMLElement | null} displayTarget - The HTML element that will render the items
    * @property {string} defaultItem - The item rendered by default
    * @property {LoaderMenuItem[]} items - Menu items setup
    * @property {string} selectedItem - The item that is currently selected
    
    @typedef {Object} LoaderMenuItem - Configuration object for menu items
    * @property {string} id - The item's unique id attribute
    * @property {string} label - The item label in the interface
    * @property {string} [faIcon] - The items's FontAweasome icon in the interface (optional)
    * @property {string} [path] - The path to the item content in the .html file (optional)
    * @property {function(): void} [action] - A callback that is called whenever the item is selected from the menu
    * @property {boolean} [notify] - If true the tab can display notifications


    METHODS:

    setup method: Configure the component so that it can function correctly
    * @param {Object} setupInfos - Configurations for the setup
        * @param {string} target - Target selector
        * @param {string} default - Default item
        * @param {LoaderMenuItem[]} items - Menu items
*/

/*
    EXAMPLE:

    const loaderMenu = document.createElement('loader-menu');
    loaderMenu.setup({
        target: 'div#target',
        default: 'home',
        
        items: [
            { id: 'home', label: 'Principal', faIcon: 'fa-home', path: '/home.html' },
            { id: 'about', label: 'Sobre', path: '/about.html', notify: false },
            {
                id: 'contacts', label: 'Contatos', path: '/contact.html',
                action: () => console.log('Contact loaded!')
            }
        ]
    });

    document.body.appendChild(loaderMenu);
*/


import HTMLParser from "../helpers/html-parser.js";
import stylesRaw from '../../less/components/_loader-menu.less?raw';


const kStorageKey = Symbol('kStorageKey');
const kSetuped = Symbol('kSetuped');
const kLoadedRaws = Symbol('kLoadedRaws');
const kItemsPaths = Symbol('kItemsPaths');
const kItemsActions = Symbol('kItemsActions');
const kSetRole = Symbol('kSetRole');
const kStyles = Symbol('kStyles');
const kLoaderMenu = Symbol('kLoaderMenu');
const kAddItemsEvents = Symbol('kAddItemsEvents');
const kUpdateSelected = Symbol('kUpdateSelected');
const kLoadHTML = Symbol('kLoadHTML');
const kExecuteAction = Symbol('kExecuteAction');
const kVerifyRepeatedItems = Symbol('kVerifyRepeatedItems');
const kVerifyDefaultItem = Symbol('kVerifyDefaultItem');
const kUpdateItemBackground = Symbol('kUpdateItemBackground');
const kGetItemRaw = Symbol('kGetItemRaw');

// <loader-menu></loader-menu>

class LoaderMenu extends HTMLElement {
    static [kStorageKey] = 'last-panel-selected';

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });  
        
        this[kSetuped] = false;
        this[kLoadedRaws] = {};
        this[kItemsPaths] = {};
        this[kItemsActions] = {};
        this.displayTarget = null;
        this.defaultItem = null;
        this.items = [];
        this.selectedItem = null;
    }

    async connectedCallback() {
        if (!this[kSetuped]) {
            console.error('loader-menu is not setuped');
            throw new Error('loader-menu is not setuped');
        }

        this[kSetRole]();

        this.shadowRoot.appendChild(this[kStyles]());
        this.shadowRoot.appendChild(this[kLoaderMenu]());

        const eventsTask = async () => this[kAddItemsEvents]();

        const renderFirstItemTask = async () => {
            this[kUpdateSelected]();
            await this[kLoadHTML]();
            await this[kExecuteAction]();
        };

        await Promise.all([
            (async () => await eventsTask())(),
            (async () => await renderFirstItemTask())()
        ]);
    }

    // Methods:
    setup({ target, default: defaultItem, items }) {
        this[kSetuped] = true;

        this.displayTarget = document.querySelector(target);

        this.items = items;
        this[kVerifyRepeatedItems]();

        this.defaultItem = defaultItem || this.items[0];
        this[kVerifyDefaultItem]();

        this.selectedItem = sessionStorage.getItem(this[kStorageKey]) || this.defaultItem;

        // Maps
        this[kLoadedRaws] = this.items.reduce((raws, { id }) => {
            raws[id] = null;
            return raws;
        }, {});

        this[kItemsPaths] = this.items.reduce((paths, { id, path }) => {
            paths[id] = path;
            return paths;
        }, {});

        this[kItemsActions] = this.items.reduce((actions, { id, action }) => {
            actions[id] = action;
            return actions;
        }, {});
    }

    [kSetRole]() {
        this.role = 'navigation';
        this.setAttribute('role', 'navigation');
    }

    [kAddItemsEvents]() {
        const items = this.shadowRoot.querySelectorAll('.items-list__item');

        items.forEach(itemEl => {
            const { id: itemId } = this.items
                .find(item => item.id === itemEl.id);

            itemEl.addEventListener('click', async () => {
                this.selectedItem = itemId;
                this[kUpdateSelected]();
                await this[kLoadHTML]();
                await this[kExecuteAction]();
            });
        });
    }

    [kUpdateSelected]() {
        sessionStorage.setItem(this[kStorageKey], this.selectedItem);        
        this[kUpdateItemBackground]();
    }

    // Main:
    async [kLoadHTML](item_id){
        const itemKey = item_id || this.selectedItem;

        if (this[kLoadedRaws][itemKey]) {
            this.displayTarget.innerHTML = this[kLoadedRaws][itemKey];
            return;
        }
        
        if (!this[kItemsPaths]?.[itemKey]) return;

        try {
            const res = await fetch(this[kItemsPaths][itemKey]);
            const loadedHTMLRaw = await res.text();
    
            this[kLoadedRaws][itemKey] = loadedHTMLRaw;
            this.displayTarget.innerHTML = loadedHTMLRaw;
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    async [kExecuteAction](item_id) {
        const itemKey = item_id || this.selectedItem;
        await this[kItemsActions][itemKey]?.();
    }
    
    // Validation: 
    [kVerifyRepeatedItems]() {
        const ids = [];

        this.items.forEach(({ id }) => {
            if (ids.includes(id)) {
                console.error(`items cannot contain duplicate ids. Duplicated: ${id}`);
                throw new ReferenceError(`items cannot contain duplicate ids. Duplicated: ${id}`);
            }
            
            ids.push(id);
        });
    }

    [kVerifyDefaultItem]() {
        const defaultItemIsInItems = this.items.some(({ id }) => id === this.defaultItem);

        if (!defaultItemIsInItems) {
            console.error(`${this.defaultItem} is not in items`);
            throw new ReferenceError(`${this.defaultItem} is not in items`);
        }
    }

    // Interface:
    [kUpdateItemBackground](item) {
        const items = this.shadowRoot.querySelectorAll('.items-list__item');
        const itemEl = item || this.shadowRoot.querySelector(`.items-list__item.${this.selectedItem}`);

        items.forEach(item => {
            item.classList
                .remove('items-list__item--selected');
        });

        itemEl.classList.add('items-list__item--selected');
    }

    [kGetItemRaw]({ id, label, faIcon = '', notify = true }) {
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

    [kLoaderMenu]() {
        let itemsRaw = '';

        this.items.forEach(({ id, label, faIcon, notify }) => {
            itemsRaw += this[kGetItemRaw]({ id, label, faIcon, notify });
        });

        return HTMLParser.parse(`<ul role="tablist" id="items-list">${itemsRaw}</ul>`);
    }

    [kStyles]() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }
}

customElements.define('loader-menu', LoaderMenu);
export default LoaderMenu;
