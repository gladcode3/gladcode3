/*
    WARNING:
    
    This component has a problem,
    when placing an addEventListener in any of its instances it triggers the events incorrectly
*/

/*
    SwitchElement class: Create a switch input in HTML using the <switch-input> tag
    * @element switch-input
    * @attribute {boolean} checked - true if the switch is on and false otherwise
    * @attribute {boolean} disabled - true if the switch is disabled and false otherwise

    METHODS:

    toggleValue method: Turns the switch ON (true) or OFF (false)

    toggleDisabled method: Enable or disable the switch

    enable method: Enable the switch
    
    disable method: Disable the switch
*/

/*
    EXAMPLES:

    // Ex. 1: (HTML)
    <form>
        <fieldset>
            <label for='my-switch1'>Preference 1:</label>
            <switch-input id='my-switch1'></switch-input>

            <label for='my-switch2'>Preference 2:</label>
            <switch-input id='my-switch2' checked disabled></switch-input>
        </fieldset>
    </form>


    // Ex. 2: (JS)
    const mySwitch1 = document.querySelector('#my-switch1');
    const mySwitch2 = document.querySelector('#my-switch2');

    mySwitch1.disable(); // Disable switch
    mySwitch2.enable(); // Enable switch

    mySwitch1.toggleDisabled(); // Enable switch again

    console.log(mySwitch1.checked); // false
    mySwitch1.toggleValue();
    console.log(mySwitch1.checked); // true

    console.log(mySwitch1.disable);


    // Ex. 3: (JS)
    const switchInput = document.querySelector('.my-switch');

    console.log(switchInput.value === switchInput.checked); // true
    
    switchInput.toggleValue();
    console.log(switchInput.value === switchInput.checked); // true

    // SwitchInput.value and SwitchInput.checked are the same thing
*/

import HTMLParser from '../helpers/html-parser.js';

import raw from '../../less/components/_switchs.less?raw';

class SwitchElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this._value = this.hasAttribute('checked');
        this._disabled = this.hasAttribute('disabled');
        
        this.relationId = 'switch-input';
        this.styleNodeElement = this.#generateStyles();
        this.switchNodeElement = this.#generateSwitch();
    }

    #generateSwitch() {
        const switchRaw = `
            <div class="switch">
                <input id="${this.relationId}" type="checkbox">
                <label id="switch-element" for="${this.relationId}"></label>
            </div>
        `;

        const __switch = HTMLParser.parse(switchRaw);

        return __switch;
    }

    #generateStyles() {
        const styles = HTMLParser.parse(`<style>${raw}</style>`);

        return styles;
    }

    #setChangeEvent() {
        const checkbox = this.shadowRoot.querySelector(`#${this.relationId}`);

        checkbox.addEventListener('change', () => {
            this.toggleValue();
        });
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.styleNodeElement);
        this.shadowRoot.appendChild(this.switchNodeElement);
        this.#renderCheckbox();
        this.#setChangeEvent();
    }

    // Getters
    get value() { return this._value; }
    get checked() { return this._value; }
    get disabled() { return this._disabled; }

    // Setters
    set value(val) { this._value = val; this.#renderCheckbox(); }
    set checked(val) { this._value = val; this.#renderCheckbox(); }
    set disabled(val) { this._disabled = val; this.#renderCheckbox(); }
    
    #renderChecked() {
        if (this._value) {
            this.setAttribute('checked', '');
            return;
        }

        this.removeAttribute('checked');
    }

    #renderDisabled() {
        if (this._disabled) {
            this.setAttribute('disabled', '');
            return;
        }

        this.removeAttribute('disabled');
    }

    #renderCheckbox() {
        this.#renderChecked();
        this.#renderDisabled();

        const checkbox = this.shadowRoot.querySelector(`#${this.relationId}`);

        if (checkbox) {
            checkbox.checked = this._value;
            checkbox.disabled = this._disabled;
        }
    }

    // Methods

    toggleValue() {
        this._value = !this._value;
        this.#renderCheckbox();
    }

    toggleDisabled() {
        this._disabled = !this._disabled;
        this.#renderCheckbox();
    }

    enable() {
        this._disabled = false;
        this.#renderCheckbox();
    }

    disable() {
        this._disabled = true;
        this.#renderCheckbox();
    }
}

customElements.define('switch-input', SwitchElement);

export default SwitchElement;
