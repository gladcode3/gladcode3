/*
    Post class: Create a new post and put in HTML
    * @param {Object} infos - Post information
        * @param {string} infos.title - Post title
        * @param {Timestamp} infos.time - Post timestamp
        * @param {string} infos.body - Internal HTML content of the Post
    * @param {string} targetSelector - Element selector in which the post will be inserted
    
    @typedef {Object} Timestamp - set of year, month, day, hours and minutes
    * @property {number} year - Timestamp year
    * @property {number} month - Timestamp month index
    * @property {number} day - Timestamp day
    * @property {number} hours - Timestamp hours
    * @property (number) minutes - Timestamp minutes


    METHODS:

    getTimestamp method: Returns a formatted timestamp with or without a label
    * @param {boolean} [withLabel] - If true, the label is returned along with the timestamp (optional)
    * @returns {string} The formatted timestamp

    generatePost method: Get the Post DOM-Element and put in "element" attribute
    * @returns {ChildNode | null} The DOM element of the Post or null
*/

/*
    EXAMPLES:

    // Ex. 1:
    const timestamp = {
        year: 2008,
        month: 4, // Index 4 = 'may',
        day: 10,
        hours: 0,
        minutes: 0
    };

    const myPostData = {
        title: 'My Post Title',
        time: timestamp,
        body: 'Post Content...'
    };

    const myPost = new Post(myPostData, '#my-element');

    console.log(myPost.element);
    console.log(myPost.getTimestamp());


    // Ex. 2:
    const now = new Date();
    const nowTimestamp = {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
        milliseconds: now.getMilliseconds()
    };

    const postData = {
        // undefined title = 'Untitled'
        time: nowTimestamp,
        // undefined body = ''
    };

    const post = new Post(postData); // undefined targetSelector = '.news-panel__news'
*/

import DateFormatter from "../helpers/date-formatter.js";

class Post {
    constructor({ title = 'Untitled', time, post: body='' }, targetSelector = '.news-panel__news') {
        this.title = title;
        this.time = new Date(time);
        this.body = body;

        this.element = this.generatePost();

        const target = document.querySelector(targetSelector);
        target.appendChild(this.element);
    }

    getTimestamp(withLabel = false) {
        const timestamp = DateFormatter.formatAs('%D/%M/%Y - %H:%m', this.time)
        return withLabel ? `Publicado em ${timestamp}` : timestamp;
    }

    generatePost() {
        const timestamp = this.getTimestamp(true);

        const postHTML = `
            <article class="news__post">
                <header class="post__header">
                    <h3>${this.title}</h3>

                    <span class="header__timestamp">${timestamp}</span>
                </header>

                <div class="post_body">${this.body}</div>

                <button class="post__share-btn">
                    <i class="fas fa-share-alt"></i>
                </button>
            </artic>
        `;

        // Parse HTML String
        const parser = new DOMParser();
        const postElement = parser.parseFromString(postHTML, 'text/html');
    
        const post = postElement.body.firstChild;

        this.element = post;
        return post;
    }
}

export default Post;
