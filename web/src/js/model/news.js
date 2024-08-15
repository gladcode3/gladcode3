class Post {
    constructor({ id, post, time, title }) {
        this.id = id;
        this.post = post;
        
        const fullMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

        const timeDate = new Date(time);

        this.time = {
            year: timeDate.getFullYear(),
            month: fullMonths[timeDate.getMonth()],
            day: timeDate.getDate(),
            hours: timeDate.getHours(),
            minutes: timeDate.getMinutes(),
            seconds: timeDate.getSeconds(),
            milliseconds: timeDate.getMilliseconds()
        };

        this.title = title;

        const postElement = this.generatePost(this.title, this.time, this.post);
        const news = document.querySelector('.news-panel__news');
        news.appendChild(postElement);
    }

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
    }
}

export default Post;