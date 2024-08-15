import News from "../model/news-request.js";
import Post from "../model/news.js";

const newsAction = async () => {
    const newsRequest = new News({ page: 1 });
    const newsData = await newsRequest.getNews();

    newsData.posts.forEach(postInfo => {
        new Post(postInfo);
    });
};

export default newsAction;