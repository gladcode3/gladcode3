function decodeJWT(jwt) {
    const [,encodedPayload] = jwt.split('.');
    const base64 = encodedPayload.replaceAll('-', '+').replaceAll('_', '/');
    const payload = JSON.parse(atob(base64));

    return payload;
}

export default decodeJWT;
