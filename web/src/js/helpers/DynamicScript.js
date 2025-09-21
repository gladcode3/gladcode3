// The DynamicScript class is a utility designed to dynamically load external JavaScript files into a web page. It ensures that the script is only loaded once, even if multiple instances of the class are created with the same URL. Additionally, it provides a callback mechanism to execute code once the script is successfully loaded.
// Example usage:
// new DynamicScript('https://example.com/script.js', () => {
//     // Code to execute after the script has loaded
// });
// or
// await new DynamicScript('https://example.com/script.js').load();

export default class DynamicScript {

    loaded = false;

    constructor(url, callback) {
        this.url = url;
        this.callback = callback;

        if (!document.head.querySelector(`script[src="${this.url}"]`)) {
            const script = document.createElement('script');
            script.src = this.url;
            script.async = true;
            document.head.appendChild(script);
    
            script.onload = () => {
                this.loaded = true;
            }
        }
        else {
            this.loaded = true;
        }

        if (this.callback) {
            this.load(this.callback);
        }
    }

    async load(callback) {
        if (callback) {
            this.callback = callback;
        }

        if (this.loaded) {
            return this.callback ? this.callback() : true;
        } else {
            return await new Promise(resolve => setTimeout(async () => resolve(await this.load())), 100);
        }
    }

    isLoaded() {
        return this.loaded;
    }
}