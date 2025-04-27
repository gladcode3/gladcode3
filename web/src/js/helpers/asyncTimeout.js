function asyncTimeout(ms) {
    let cancel;
    const promise = new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, ms);
        cancel = () => {
            clearTimeout(timeout);
            reject(new Error('Cancelled'));
        };
    });
    promise.cancel = cancel;
    return promise;
}

export default asyncTimeout;
