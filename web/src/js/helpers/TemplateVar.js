// TemplateVar helper class to get template variables from the DOM
// When the page is rendered, the server might sends some template variables that are used in the client-side. This class helps to get those variables.
//  Usage:
//  const variable = TemplateVar.get('variableName'); // get the variable value


export default class TemplateVar {

    static vars = {};
    static isBuilt = false;

    static build() {
        const e = document.querySelector('#template-vars');
        if (!e) return;

        try {
            const vars = new URLSearchParams(e.value);
            vars.forEach((value, key) => {
                TemplateVar.vars[key] = TemplateVar.format(value);
            });
        }
        catch (error) {
            console.error('Error parsing template variable:', error);
        }

        e.remove();
        TemplateVar.isBuilt = true;
    }

    static format(value) {
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (!isNaN(value)) return Number(value);
        return value;
    }

    static get(key) {
        if (!TemplateVar.isBuilt) {
            TemplateVar.build();
        }
        if (!key) {
            return TemplateVar.vars;
        }
        return TemplateVar.vars[key];
    }
}