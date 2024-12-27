import Session from "./session.js";
import Api from "../helpers/api.js";

Session.validate();
const api = new Api();

class News {
    constructor({ limit = 10 } = {}) {
        // if (!(target instanceof HTMLElement)) {
        //     console.log('target is not a HTMLElement');
        //     throw new TypeError('target is not a HTMLElement');
        // }
        
        // Constants...
        // this.target = target;
        this.limit = limit;
        
        // Variables...
        this.page = 1;
        // this.lastPage = null;

        // const newsObserver = new IntersectionObserver(([post]) => {
        //     if (!post.isIntersecting) return;
        // });
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
