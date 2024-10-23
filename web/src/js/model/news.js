// import validateSession from "../helpers/session-validator.js";
import Request from "../helpers/request.js";

// const api = await validateSession();

const api = new Request({ url: 'https://api.localtest.me'});
console.log(api);

export default class News {
    constructor({ page, limit }) {
        this.page = page;
        this.limit = limit;
    }

    async getNews() {
        const data = await api.post('back_news', {
            action: 'GET',
            page: this.page,
        })

        return data;
    }
}