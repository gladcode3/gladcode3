// Api Class - automate requests to the api using the Request class
// Usage: 
// const entity = await new Api().get('route', { ...args });


import GoogleLogin from "./GoogleLogin.js";
import Request from "./Request.js";
import TemplateVar from "./TemplateVar.js";

export default class Api {
    constructor({ auth, token }={}) {
        this.auth = auth || true;
        this.token = token;
        this.requestInstance = this.setInstance();
    }

    setInstance() {
        if (!this.auth) {
            const requestInstance = new Request({ 
                url: `https://${TemplateVar.get('apiurl')}`,
            });
            return requestInstance;
        }

        const token = this.token || GoogleLogin.getCredential()?.token;

        if (!token) {
            throw new Error('Credential not found');
        }

        const requestInstance = new Request({ 
            url: `https://${TemplateVar.get('apiurl')}`,
            headers: { 'Authorization': `Bearer ${token}` }
        });

        return requestInstance;
    }

    async get(endpoint, data) {
        return this.requestInstance.get(endpoint, data);
    }

    async post(endpoint, data) {
        return this.requestInstance.post(endpoint, data);
    }

    async put(endpoint, data) {
        return this.requestInstance.put(endpoint, data);
    }

    async delete(endpoint, data) {
        return this.requestInstance.delete(endpoint, data);
    }
}