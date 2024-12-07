/*
    HTMLParser class: Able to parse a string in HTML format, whether the string has one or several tags together


    METHODS:

    parse() method: Returns the first tag in the string as an HTML element
    * @param {string} HTMLString - String in HTML tag format
    * @returns {HTMLElement | null} The parsed DOM element
    * @static

    parseAll() method: Returns all tags in the string as a NodeList of DOM elements
    * @param {string} HTMLString - String in HTML tag format
    * @returns {NodeListOf<ChildNode>} The parsed DOM elements
    * @static
*/

/*
    EXAMPLES:

    // Ex. 1:

    const rawContent = '<span>Internal Content...</span>';
    const raw = `<div class="c1 c2 c3">${rawContent}</div>`;
    const parsedElement = HTMLParser.parse(raw);


    // Ex. 2:

    const raw1 = '<div class="tag1">Tag 1</div>';
    const raw2 = '<div class="tag2">Tag 1</div>';
    const raw3 = '<div class="tag3">Tag 1</div>';

    // The line below will generate a NodeList with 3 DOM elements
    const parsedElementsList = HTMLParser.parseAll(raw1 + raw2 + raw3);
*/

class HTMLParser {
    static parseAll(HTMLString) {
        const parser = new DOMParser();
        const parsedDoc = parser.parseFromString(HTMLString, 'text/html');
        
        const parseError = parsedDoc.querySelector('parsererror');
        
        if (parseError) {
            console.error('HTMLString is invalid');
            throw new Error('HTMLString is invalid');
        }
        
        const parseFragment = document.createDocumentFragment();
        const appendChildCallback = node => parseFragment.appendChild(node);

        // Insert all childs in fragment
        Array.from(parsedDoc.body.childNodes)
            .forEach(appendChildCallback);

        Array.from(parsedDoc.head.childNodes)
            .forEach(appendChildCallback);

        const tempDiv = document.createElement('div');
        tempDiv.appendChild(parseFragment);

        return tempDiv.childNodes;
    }

    static parse(HTMLString) {
        return this.parseAll(HTMLString)[0] || null; 
    }
}

export default HTMLParser;
