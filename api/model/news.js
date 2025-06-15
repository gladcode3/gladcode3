import Db from '../core/mysql.js';
import CustomError from '../core/error.js';
import crypto from 'crypto';

export default class News {

    constructor({ id, title, time, post, hash}){
        this.id = id;
        this.title = title;
        this.time = time;
        this.post = post;
        this.hash = hash;
    }
    
    static async get(page, qnt){

        if(!page) throw new CustomError(400, "Page was not sent.");
        if(!qnt) throw new CustomError(400, "No limit was sent.");
        if(isNaN(page) || isNaN(qnt)) throw new CustomError(400, "Query must be a number.");

        const offset = (page*qnt)-qnt;

        const news = await Db.find('news', 
            {
                filter: {id: Db.like("%")}, 
                view: ['id', 'title', 'time', 'post'],
                opt: { limit: qnt, order: { id: -1}, skip: offset },
                skip: offset
            }
        );
        if(news.length === 0) throw new CustomError(404, "Page contains no posts.");

        return { "code": 200, "news": news };
    };

    static async getByHash(hash) {
        const posts = {
            prevPost: null,
            currentPost: null,
            nextPost: null
        };

        const allPosts = await Db.find('news', {
            view: ['id', 'title', 'time', 'post'],
            opt: { sort: [{ time: 'ASC' }] }
        });

        const index = allPosts.findIndex(p => genHash(p.id) === hash);
        if (index === -1) throw new CustomError(404, `No posts were found with hash: ${hash}`);

        posts.currentPost = allPosts[index];
        if (index > 0) posts.prevPost = allPosts[index - 1];
        if (index < allPosts.length - 1) posts.nextPost = allPosts[index + 1];

        return cleanPostObj(posts);
    }

    static async fetchPrevPost(basetime){
        const prevNews = await Db.find('news',
            {
                filter: { time: {'<': basetime} },
                view: ['id', 'title', 'time', 'post'],
                opt: { limit: 1,  order: {time: -1}}
            }
        );
        if(prevNews.length === 1) return prevNews;
        return false;
    };

    static async fetchNextPost(basetime){
        const nextNews = await Db.find('news',
            {
                filter: { time: {'>': basetime} },
                view: ['id', 'title', 'time', 'post'],
                opt: { limit: 1 }
            }
        );
        if(nextNews.length === 1) return nextNews;
        return false;
    }
}

function cleanPostObj(obj){
    const newObj = {}
    if(obj.prevPost !== null) newObj.prevPost = obj.prevPost;
    if(obj.currentPost !== null) newObj.currentPost = obj.currentPost;
    if(obj.nextPost !== null) newObj.nextPost = obj.nextPost
    newObj.code = 200;

    return newObj;
}

function genHash(id) {
    const hash = crypto.createHash('md5').update(`${id}news-post-86`).digest('hex');
    return hash.substring(0, 4);
}