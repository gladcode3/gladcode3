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
import HTMLParser from "../helpers/html-parser.js";

import stylesRaw from '../../less/components/_post.less?raw';


// Transformar Post num WebComponent <gc-post>
// <gc-post> deve ter um método setup para configurar os dados do usuário

const kTitleElement = Symbol('kTitleElement');
const kTimestampElement = Symbol('kTimestampElement');
const kBodyElement = Symbol('kBodyElement');
const kPost = Symbol('kPost');
const KStyles = Symbol('kStyles');
const kHandleSourceErrors = Symbol('kHandleSourceErrors');
const kFindElements = Symbol('kFindElements');

class GladcodePost extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this[kTitleElement] = null;
        this[kTimestampElement] = null;
        this[kBodyElement] = null;

        this.postTitle = null;
        this.postTime = null;
        this.postBody = null;
        this.datetime = null;
        this.timestamp = null;
    }
    
    connectedCallback() {
        this.role = 'article';
        this.setAttribute('role', 'article');
        
        this.shadowRoot.appendChild(this[KStyles]());
        this[kPost]().forEach(html_elment => {
            this.shadowRoot.appendChild(html_elment);
        });

        this[kHandleSourceErrors]();
        this[kFindElements]();
    }

    setup({ title = 'Untitled', time, post: body='' } = {}) {
        this.postTitle = title;
        this.postTime = new Date(time);
        this.postBody = body;
        this.datetime = DateFormatter.formatAs('%Y-%M-%D', this.postTime);
        this.timestamp = DateFormatter.formatAs('%D/%M/%Y - %H:%m', this.postTime);

        this[kTitleElement].textContent = this.postTitle;
        this[kTimestampElement].setAttribute('datetime', this.datetime)
        this[kTimestampElement].textContent = `Publicado em ${this.timestamp}`;
        this[kBodyElement].innerHTML = this.postBody;
    }
    
    [kHandleSourceErrors]() {
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

    [kFindElements]() {
        this[kTitleElement] = this.shadowRoot.querySelector('h3');
        this[kTimestampElement] = this.shadowRoot.querySelector('#timestamp');
        this[kBodyElement] = this.shadowRoot.querySelector('#post-body');
    }

    [kPost]() {
        return HTMLParser.parseAll(`
            <header>
                <h3>Title</h3>

                <time datetime="" id="timestamp">Timestamp</time>
            </header>

            <div id="post-body"></div>

            <button id="share-btn">
                <i class="fas fa-share-alt"></i>
            </button>
        `);
    }

    [KStyles]() {
        return HTMLParser.parse(`<style>${stylesRaw}</style>`);
    }
}

customElements.define('gc-post', GladcodePost);

export default GladcodePost;
