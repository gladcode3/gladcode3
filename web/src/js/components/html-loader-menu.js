/*
HTMLLoaderMenu class: Loads an HTML menu with various items

const myMenu = new HTMLLoaderMenu({ menu, items, target });

items:
    - id: (required) a unique id for the item
    - path: (optional) the path to the item's content
    - default: (optional) if true, this item will be loaded by default
    - action: (optional) a function that will be executed when the item is loaded

Example:

const myMenu = new HTMLLoaderMenu({
    menu: document.getElementById('myMenu'),
    items: [
        { id: 'home', path: 'home.html', default: true },
        { id: 'about', path: 'about.html' },
        { id: 'contact', path: 'contact.html', action: () => console.log('Contact loaded') }
    ],
    target: document.getElementById('content')
});
*/

class HTMLLoaderMenu {
    constructor({ menu, items, target }) {
        this.menu = menu;
        this.verifyHTMLElement(this.menu, 'menu')

        this.items = items;
        this.verifyItemsStructure();
        this.verifyRepeatedIDs();

        this.itemElements = this.menu.querySelectorAll('.panels__panel');

        this.target = target;
        this.verifyHTMLElement(this.target, 'target')

        this.default = this.items[0].id;

        this.items.forEach(e => {
            if (e.default)
                this.default = e.id;
        });

        this.selected = sessionStorage.getItem('lastSelectedPanel') || this.default;

        this.itemElements.forEach(e => {
            if (e.id === this.selected)
                this.__setItemSelectedBackgrond(e);
        })

        this.HTMLTextsOfLoadedItems = this.items.reduce((acc, item) => {
            acc[item.id] = null;

            return acc;
        }, {});

        this.actionsOfItems = this.items.reduce((acc, item) => {
            acc[item.id] = item.action;

            return acc;
        }, {});

        this.build();
    };

    verifyItemsStructure() {
        if (Array.isArray(this.items)) {
            this.items.forEach((e, i) => {
                const eValueIsObject = (
                    e !== null
                    && typeof e === 'object'
                    && e.constructor === Object
                    && !Array.isArray(e)
                );

                if (eValueIsObject) {
                    if (!e.hasOwnProperty('id')) {
                        const idError = new Error(`items[${i}] does not contain the 'id' property`);

                        console.error(idError);
                        throw idError;
                    };
                } else {
                    const itemObjectError = new TypeError(`items[${i}] is not an object literal`);

                    console.error(itemObjectError);
                    throw itemObjectError;
                };
            });
        } else {
            const itemsArrayError = new TypeError('items is not an array');

            console.error(itemsArrayError);
            throw itemsArrayError;
        };
    };

    verifyRepeatedIDs() {
        const IDList = [];

        this.items.forEach(e => {
            if (IDList.includes(e?.id))
                throw new Error('items contains objects with the same id');
            else
                IDList.push(e?.id);
        });
    };

    verifyHTMLElement(element, name) {
        if (element instanceof HTMLElement) {
            if (!document.body.contains(element))
                throw new Error(`${name} does not exist in the document`);

            this[name] = element;
        } else
            throw new TypeError(`${name} must be an instance of HTMLElement`);
    };

    build() {
        window.addEventListener('load', this.generateHTMLContent());

        this.setSelectedItem();
    };

    generateHTMLContent() {
        const items = this.items;

        const itemPaths = items.reduce((acc, item) => {
            acc[item.id] = item.path;

            return acc;
        }, {});

        const HTMLStringKey = this.selected;

        if (!this.HTMLTextsOfLoadedItems[HTMLStringKey] === null) {
            this.target.innerHTML = this.HTMLTextsOfLoadedItems[HTMLStringKey];

            this.actionsOfItems[HTMLStringKey]?.();

            // More about the optional chaining (?.) operator in:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
        } else if (itemPaths?.[HTMLStringKey]) {
            fetch(itemPaths[HTMLStringKey])
            .then(res => res.text())
            .then(loadedHTMLString => {
                this.HTMLTextsOfLoadedItems[HTMLStringKey] = loadedHTMLString;
    
                this.target.innerHTML = loadedHTMLString;

                this.actionsOfItems[HTMLStringKey]?.();
            })
            .catch(error => {
                console.error(error);
                throw error;
            });
        } else this.actionsOfItems[HTMLStringKey]?.();
    };

    __setItemSelectedBackgrond(item) {
        this.itemElements.forEach(element => element.classList.remove('panels__panel--selected'));

        item.classList.add('panels__panel--selected');
    };

    setSelectedItem() {
        this.itemElements.forEach(element => element.addEventListener('click', () => {
            this.__setItemSelectedBackgrond(element);

            const selectedItem = this.menu.querySelector('.panels__panel--selected');

            this.selected = selectedItem.id;
            sessionStorage.setItem('lastSelectedPanel', selectedItem.id);

            this.generateHTMLContent();
        }));
    };
};

export default HTMLLoaderMenu;