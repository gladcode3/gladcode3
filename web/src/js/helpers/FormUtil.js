class FormUtil {
    constructor(form) {
        this._form = form;
    }

    getValuesMap() {
        const values = {};
        const elements = this._form.querySelectorAll('input, select, textarea');
    
        elements.forEach(el => {
            const { name, type, checked, value } = el;
    
            if (!name) return;
    
            if (type === 'checkbox') {
                values[name] = checked;
                return;
            }
            
            if (type === 'radio' && checked) {
                values[name] = value;
                return;
            }
                
            values[name] = value;
        });
    
        return values;
    }

    fillWithValues(valuesMap) {
        const fields = this._form.querySelectorAll('[name]');
    
        fields.forEach(field => {
            const { name = null } = field;
    
            if (name in valuesMap) {
                if (field.type === 'checkbox') {
                    field.checked = Boolean(valuesMap[name]);
                    return;
                }
                
                if (field.type === 'radio' && field.value === String(valuesMap[name])) {
                    field.checked = true;
                    return;
                }
                
                field.value = valuesMap[name];
            }
        });
    } 
}

export default FormUtil;
