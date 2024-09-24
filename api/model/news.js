import Db from '../core/mysql.js';
import CustomError from '../core/error.js';


export default class News {

    constructor({ id, title, time, post}){
        this.id = id;
        this.title = title;
        this.time = time;
        this.post = post;
    }

    static async getNews(){
        try{
            const news = await Db.find('news', 
                {
                    filter: {id: Db.like("%")}, 
                    view: ['id', 'title', 'time', 'post'],
                    opt: { sort: { id: -1} }
                });
                if(news.length === 0) return;

            const jsonArray = jsonIfy(news)
            return jsonArray;
            
        }catch(error){
            throw new CustomError(500, `Internal Server error`, error.message)
        }
    }

    static async getNewsById(id){
        try {
            const news = await Db.find('news', 
                {
                    filter: { id: id },
                    view: ['id', 'title', 'time', 'post'],
                    opt: { limit: 1 }
                });
            if(news.length === 0) return;
            
            const jsonArray = jsonIfy(news);
            return jsonArray;
        } catch (error) {
            throw new CustomError(500, "Internal Server Error", error.message)
        }
    }
}

function jsonIfy (array){
    const newArray = []
    array.forEach(e => {
        newArray.push(JSON.stringify(e))
    });
    return newArray;
}