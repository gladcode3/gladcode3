import Session from "./session.js";
import Api from "../helpers/api.js";

Session.validate();
const api = new Api();

// Symbol é usado como uma "chave de acesso" a propriedades e métodos privados.
const kLimit = Symbol('kLimit');
const kPage = Symbol('kPage');

class News {
    constructor({ limit = 10 } = {}) {
        this[kLimit] = limit;
        this[kPage] = 1;
    }

    async getNews() {
        const data = await api.get('news', {
            page: this[kPage],
            limit: this[kLimit]
        });

        return data;
    }

    nextPage() {
        // Increment this.page and then return
        return ++this[kPage];
    }
}

export default News;
