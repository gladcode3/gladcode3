import Session from "./session.js";
import Api from "../helpers/api.js";

Session.validate();
const api = new Api();

class News {
    constructor({ limit = 10 } = {}) {
        this.limit = limit;
        this.page = 1;
    }

    async getNews() {
        const data = await api.get('news', {
            page: this.page,
            limit: this.limit
        });

        return data;
    }

    nextPage() {
        // Increment this.page and then return
        return ++this.page;
    }
}

export default News;
