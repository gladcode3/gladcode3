import News from "../model/news.js";
import PostModel from "../model/post.js";
import Post from "../components/post.js";

const newsAction = async () => {
    const newsRequest = new News({ page: 1 });
    const newsData = await newsRequest.getNews();

    newsData.posts.forEach(postInfo => {
        const post = new PostModel(postInfo);
        new Post(post);
    });
};

export default newsAction;
