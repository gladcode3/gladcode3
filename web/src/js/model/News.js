import Session from "./Session.js";
import Api from "../helpers/Api.js";

Session.validate();
const api = new Api();


class News {
    constructor({ limit = 10 } = {}) {
        this._limit = limit;
        this._page = 1;
    }

    async getNews() {
        try {
            const data = await api.get('news', {
                page: this._page,
                limit: this._limit
            });

            return data;
        } catch (error) {
            return;
        }
    }

    nextPage() {
        // Increment this.page and then return
        return ++this._page;
    }
}

export default News;
