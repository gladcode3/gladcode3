import News from "../model/news.js";
import PostInfo from "../model/post-info.js";
import Post from "../components/post.js";

async function newsAction() {
    const news = new News({ page: 1, limit: 10 });
    const newsData = await news.getNews();

    newsData.news.forEach(post => {
        const postInfo = new PostInfo(post);
        new Post(postInfo);
    });
};

export default newsAction;
