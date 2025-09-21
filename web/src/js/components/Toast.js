// Toast class: Creates a toast message
// const myToast = new Toast(message, options);
// options
//   - timeOut: time in ms to fade out the toast. if 0, it will not fade out
//   - position: 'center' will center the toast, else it will be aligned to the right
//   - customClass: custom class to add to the toast
// Example:
// const myToast = new Toast('Hello world!', { timeOut: 5000, position: 'center', customClass: 'my-toast' });

export default class Toast {
    constructor(text, { timeOut, position='center', customClass, type }={}) {
        // create container if it doesn't exist
        let container = document.querySelector('#toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.append(container);
        }

        // place toast in the container with the text
        this.element = document.createElement('div');
        this.element.classList.add('toast');
        this.element.innerHTML = text;
        
        this.timeOut = timeOut;
        
        if (position == 'center') {
            container.classList.add('center');
        }

        if (type) {
            customClass = type;
        }
        if (customClass) {
            this.element.classList.add(customClass);
        }

        container.prepend(this.element);

        if (this.timeOut === undefined) {
            this.timeOut = 5000;
        }
        if (this.timeOut > 0) {
            this.fade();
        }
        return this;
    }

    // fade out the toast
    // timeOut: time in ms to fade out the toast
    fade(timeOut) {
        if (!timeOut) {
            timeOut = this.timeOut;
        }
        // a little bit before the toast is removed, add the fade class
        setTimeout(() => this.element.classList.add('fade'), timeOut - 1000);
        // remove toast after timeOut
        setTimeout(() => {
            this.element.remove();

            // remove container if it's empty (no more toasts inside it)
            if (!document.querySelector('#toast-container .toast') && document.querySelector('#toast-container')) {
                document.querySelector('#toast-container').remove();
            }
        }, timeOut);
    }
}