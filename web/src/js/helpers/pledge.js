// Pledge: a helper class to handle promises

// Usage:
// const pledge = new Pledge();
// someCallbackFunction((error, data) => {
//     if (error) {
//         pledge.reject(error);
//     }
//     pledge.resolve(data);
// });
// const response = await pledge.timeout(5000);


class Pledge {

    promise = null;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    static all(pledges) {
        return Promise.all(pledges.map(pledge => pledge.get()));
    }

    resolve(data) {
        this.resolve(data);
    }

    reject(data) {
        this.reject(data);
    }

    async get() {
        return this.promise;
    }

    async timeout(time) {

        let resolved = false;

        setTimeout(() => {
            if (resolved) return;
            this.resolve('Request Timeout');
        }, time);

        this.promise.then(data => {
            resolved = true;
            this.resolve(data);
        });
        
        return this.promise;
    }

    then(callback) {
        this.promise.then(callback);
        return this;
    }
}

export default Pledge;