// No documentation...

import Toast from '../components/toast.js';

export default class CustomError extends Error {
    
    static errorList = [
        'SERVER_ERROR',
        'FETCH_ERROR',
        'VALIDATION_ERROR',
    ]

    static catchAll() {

        const handle = (e) => {
            e.preventDefault();
            
            const reason = e.reason || e.error;
            if (reason.isKnown && reason.isKnown()) {
                console.error(reason);
                new Toast(reason.message, { timeOut: 5000 });
                return;
            }
        
            new Toast('😵 Ocorreu um erro inesperado', { timeOut: 5000 });
            console.error(e.reason || e.message);
        };

        window.addEventListener('unhandledrejection', e => handle(e));
        window.addEventListener('error', e => handle(e));
    }

    constructor(type, message, data) {
        super(message);
        this.type = type;
        this.data = data;
    }

    isKnown() {
        return CustomError.errorList.includes(this.type);
    }

}

