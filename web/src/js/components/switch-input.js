class Switch extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.onOffState = false;
    };

    connectedCallback() { this.build() };

    build() {
        this.shadowRoot.appendChild(this.styles());
        this.shadowRoot.appendChild(this.createSwitch());
    };

    getBooleanState() {
        const checkbox = this.shadowRoot.querySelector('#switch-input');

        return checkbox.checked;
    };

    createCheckbox() {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'switch-input';

        return checkbox;
    };

    createLabel() {
        const label = document.createElement('label');
        label.setAttribute('for', 'switch-input')
        label.id = 'switch-element';

        return label;
    };

    createSwitch() {
        const switchButton = document.createElement('div');
        switchButton.classList.add('switch');
        switchButton.appendChild(this.createCheckbox());
        switchButton.appendChild(this.createLabel());

        return switchButton;
    };

    styles() {
        const styles = document.createElement('style');
        styles.innerText = `
            :root {
                --gray-c: #ccc;
                --gc-blue: #00638d;
            }

            .switch {
                position: relative;
                margin: 10px 10px 10px 30px;
                display: flex;
            }

            #switch-input {
                margin: 0;
                padding: 0;
                width: 1px;
                height: 1px;
                position: relative;
                opacity: 0;
                pointer-events: none;
            }

            #switch-element {
                display: block;
                width: 3em;
                height: 1.5em;
                background-color: var(--gray-c);
                border-radius: 20px;
                position: relative;
                margin-right: 10px;
                cursor: pointer;
                transition: all 0.3s;
            }

            #switch-element:before {
                content: '';
                width: 1.4em;
                height: 1.4em;
                background: white;
                border-radius: 50%;
                position: absolute;
                top: 1px;
                left: 1px;
                transition: all 0.3s;
            }

            #switch-input:checked + #switch-element { background-color: var(--gc-blue); }
            #switch-input:checked + #switch-element:before { transform: translateX(1.5em); }
        `;

        return styles;
    };
};

export default Switch;