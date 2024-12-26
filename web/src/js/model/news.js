import Session from "./session.js";
import Api from "../helpers/api.js";

Session.validate();
const api = new Api();

class News {
    constructor({ page, limit }) {
        this.page = page;
        this.limit = limit;
    }

    async getNews() {
        const data = await api.get('news', {
            page: this.page,
            limit: this.limit
        });

        return data;
    }
}

export default News;
