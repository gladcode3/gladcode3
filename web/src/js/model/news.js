import validateSession from "../helpers/session-validator.js";

const api = await validateSession();

export default class News {
    constructor({ page }) {
        this.page = page;
    }

    async getNews() {
        const data = await api.post('back_news', {
            action: 'GET',
            page: this.page,
        })

        return data;
    }
}