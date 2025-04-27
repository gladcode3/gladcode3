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
    static _dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'meta'];
    static _dangerousAttrs = [/^on/i];

    static _verifyNodeSecurity(node, placeholders=[], templateValues=[]) {
        if (node.nodeType === Node.TEXT_NODE) {
            placeholders.forEach((ph, i) => {
                if (!node.textContent.includes(ph)) return;

                node.textContent = node.textContent.replace(ph, templateValues[i]);
            });

            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;

        for (const { name, value } of node.attributes) {
            const attrName = name.toLowerCase();
            const attrValue = value.trim().toLowerCase();

            if (attrName.startsWith('on'))
            throw new Error(`Unsafe attribute detected: ${name}`);

            if (attrValue.startsWith('javascript:'))
            throw new Error(`Unsafe attribute value detected in ${name}: ${value}`);
        }

        node.childNodes.forEach(e => {
            this._verifyNodeSecurity(e, placeholders, templateValues);
        });
    }

    static parseAll(HTMLString=``, templateValues = []) {
        const placeholders = [];

        let safeHTML = HTMLString;

        templateValues.forEach((_, i) => {
            const placeholderToken = `__PLACEHOLDER_${i}__`;
            placeholders.push(placeholderToken);

            safeHTML = safeHTML.replace('?', placeholderToken);
        });

        const parser = new DOMParser();
        const parsedDoc = parser.parseFromString(safeHTML, 'text/html');
        
        const parseError = parsedDoc.querySelector('parsererror');
        
        if (parseError) {
            console.error('HTMLString is invalid');
            throw new Error('HTMLString is invalid');
        }
        
        
        this._dangerousTags.forEach(tag => {
            if (!parsedDoc.querySelector(tag)) return;
            throw new Error(`Unsafe HTML tag detected: <${tag}>`);
        });

        parsedDoc.body.childNodes.forEach(e => {
            this._verifyNodeSecurity(e, placeholders, templateValues);
        });

        //
        
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
