import CustomError from './error.js';

async function request(route, { query, body, method='GET' }={}) {
    
    // request to production server
    const baseURL = 'https://gladcode.dev';

    const args = {
        method,
        headers: {},
    };

    // set query string
    if (query) {
        route += '?' + new URLSearchParams(query).toString();
    }
    // set request body
    if (body && method == 'POST') {
        args.body = new FormData();
        Object.entries(body).forEach(([k,v]) => args.body.append(k,v));
    }

    let text, json;
    try {
        text = await fetch(`${ baseURL }/${ route }`, args).then(data => data.text());
        json = JSON.parse(text);
        // console.log(json)
    }
    catch (error) {
        console.error(error, text);
        throw new CustomError('FETCH_ERROR', 'Erro na requisição ao servidor.', text);
    }

    if (json.error) {
        throw new CustomError('SERVER_ERROR', '⚠️ ' + json.error.message, json);
    }

    return json;

}

export default request;