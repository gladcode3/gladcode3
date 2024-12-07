// Deprecated
// No documentation...

class GladcodeV2API {
    constructor({ url, headers, sessionId }) {
        // set fixed values
        this.url = url;
        this.headers = new Headers(headers || {});

        // random session ids
        this.sessionId = sessionId || Math.random().toString(36).substring(2);
    }

    setHeader(key, value) {
        this.headers.append(key, value);
    }

    getSessionId() {
        return this.sessionId;
    }

    async get(endpoint, args) {
        return this.request('GET', endpoint, args);
    }

    async post(endpoint, args) {
        return this.request('POST', endpoint, args);
    }

    async request(method, endpoint, args={}) {
        const options = {
            method,
            headers: this.headers,
        };

        const query = {};
        query.session_id = this.sessionId;

        if (method === 'POST') {
            options.body = new FormData();
            for (const key in args) {
                options.body.append(key, args[key]);
            }
        }
        if (method === 'GET') {
            for (const key in args) {
                query[key] = args[key];
            }
        }

        const queryString = new URLSearchParams(query).toString();
        if (queryString) {
            endpoint += '?' + queryString;
        }

        const request = await fetch(`${this.url}/${endpoint}`, options);

        const text = await request.text();
        try {
            return JSON.parse(text);
        }
        catch (e) {
            return text;
        }
    }

}

export default GladcodeV2API;