/*
    GladcodePost class: Create a news-page post in HTML using the <gc-post> tag
    * @element gc-post
    * @property {string} postTitle - Title of post
    * @property {Date} postTitle - Date of post
    * @property {string} postBody - Internal HTML content of the Post
    * @property {string} datetime - Date of post in "YYYY-MM-DD" format
    * @property {string} timestamp - Date of post in "DD/MM/YYYY - HH:mm" format
    
    
    METHOD:

    setup method: Defines the characteristics of the post, must be called before inserting the element into the DOM.
    * @param {Object} infos - Post infos
        * @param {string} [infos.title] - Post Title
        * @param {string} infos.time - UTC string representing the post Date
        * @param {string} [infos.body] - Internal HTML content of the Post
*/

/*
    EXAMPLES:

    // Ex. 1:
    const post = document.createElement('gc-post');
    post.setup({
        title: 'My Title',
        time: Date.now(),
        post: 'Lorem Ipsum Dolor Sit Amet Consectur Elit...'
    });
    
    document.body.appendChild(post);
*/

import DateFormatter from "../helpers/date-formatter.js";
import HTMLParser from "../helpers/html-parser.js";

import stylesRaw from '../../less/components/_post.less?raw';


// <gc-post></gc-post>

class GCPost extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._setuped = false;

        this.postTitle = null;
        this.postTime = null;
        this.postBody = null;
        this.datetime = null;
        this.timestamp = null;
    }

    // Inherited

    connectedCallback() {
        if (!this._setuped) {
            console.error('post is not setuped');
            throw new Error('post is not setuped');
        }

        this._setAttributes();

        this.shadowRoot.appendChild(this._styles);
        this._html.forEach(tag => this.shadowRoot.appendChild(tag));

        // this._handleSourceErrors();
    }

    // Build

    _setAttributes() {
        this.role = 'article';
        this.setAttribute('role', 'article');
    }

    get _styles() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }

    get _html() {
        return HTMLParser.parseAll(`
            <header>
                <h3>${this.postTitle}</h3>

                <time datetime="${this.datetime}" id="timestamp">Publicado em ${this.timestamp}</time>
            </header>

            <div id="post-body">${this.postBody}</div>

            <button title="Compartilhar Notícia" aria-label="compartilhar notícia" id="share-btn">
                <i class="fas fa-share-alt"></i>
            </button>
        `);
    }

    // Methods

    setup({ title = 'Untitled', time, post: body='' } = {}) {
        this._setuped = true;

        this.postTitle = title;
        this.postTime = new Date(time);
        this.postBody = body;
        this.datetime = DateFormatter.formatAs('%Y-%M-%D', this.postTime);
        this.timestamp = DateFormatter.formatAs('%D/%M/%Y - %H:%m', this.postTime);
    }

    _handleSourceErrors() {
        const elementsWithSource = this.shadowRoot.querySelectorAll('[src]');
        
        elementsWithSource.forEach(async element => {
            const { src } = element;
            
            try {
                const sourceHeaders = await fetch(src, { method: 'HEAD' });
                return sourceHeaders.ok;
            } catch(error) {
                element.src = '';
            }
        });
    }
}

customElements.define('gc-post', GCPost);
export default GCPost;
