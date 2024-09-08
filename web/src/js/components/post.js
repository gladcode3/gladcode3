class Post {
    constructor({ title, time, post }) {
        this.title = title;
        this.time = time;
        this.post = post;
        
        const postElement = this.generatePost(this.title, this.time, this.post);
        const news = document.querySelector('.news-panel__news');
        news.appendChild(postElement);
    };

    // Returns Post HTMLElement
    generatePost(title, { year, month, day, hours, minutes }, post) {
        const postHTML = `
            <section class="news__post">
                <header class="post__header">
                    <h3>${title}</h3>

                    <span class="header__timestamp">Publicado em ${day}/${month}/${year} - ${hours}:${minutes}</span>
                </header>

                <div class="post_body">${post}</div>

                <button class="post__share-btn">
                    <i class="fas fa-share-alt"></i>
                </button>
            </section>
        `;

        const parser = new DOMParser();
        const postElement = parser.parseFromString(postHTML, 'text/html');
    
        // Returns DOMElement
        return postElement.body.firstChild;
    };
};

export default Post;
