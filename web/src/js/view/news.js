import News from "../model/news.js";
import PostInfo from "../model/post-info.js";
import Post from "../components/post.js";

const newsAction = async () => {
    const newsRequest = new News({ page: 1, limit: 10 });
    const newsData = await newsRequest.getNews();

    console.log(newsData);

    newsData.posts.forEach(postInfo => {
        const postInfo = new PostInfo(postInfo);
        new Post(postInfo);
    });
};

export default newsAction;
