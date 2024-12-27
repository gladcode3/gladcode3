import News from "../model/news.js";
import PostInfo from "../model/post-info.js";
import Post from "../components/post.js";

const renderPosts = posts => {
    posts.forEach(post => {
        const postInfo = new PostInfo(post);
        new Post(postInfo);
    });
};

const observeLastPost = observer => {
    if (!(observer instanceof IntersectionObserver)) {
        console.error('observer is not a IntersectionObserver');
        throw new TypeError('observer is not a IntersectionObserver');
    }

    const lastPost = document.querySelector('.news-panel__news').lastChild;
    observer.observe(lastPost);
};

async function newsAction() {
    const news = new News();
    
    const postsObserver = new IntersectionObserver(async ([lastPost], observer) => {
        if (!lastPost.isIntersecting) return;

        observer.unobserve(lastPost.target);

        try {
            news.nextPage();
            const posts = await news.getNews();

            if (!posts.news) throw new Error('Page contains no posts.');

            console.log(posts);
            renderPosts(posts.news);
            observeLastPost(observer);
        } catch (e) {
            if (e.message.includes('Page contains no posts.')) return;

            console.error(e);
        }
    });

    const posts = await news.getNews();

    console.log(posts);
    renderPosts(posts.news);
    observeLastPost(postsObserver);
}

export default newsAction;
