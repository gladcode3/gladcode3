import asyncTimeout from './asyncTimeout.js';

class Debounce {
    constructor(callback = () => {}, delayMS) {
        this._callback = callback;
        this._delay = delayMS;
    }

    getCallback() {
        let waiting = null;
        
        return async (...args) => {
            if (waiting) waiting.cancel();
        
            waiting = asyncTimeout(this._delay);
        
            try {
                await waiting;
                this._callback(...args);
            } catch (e) {}
        };
    }
}

export default Debounce;
