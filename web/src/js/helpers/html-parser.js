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
