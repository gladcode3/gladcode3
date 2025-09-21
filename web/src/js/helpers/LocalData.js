// LocalData: a class to save data to local storage, allowing to set expiration time
// new LocalData({
//     id: (string) key to save data,
//     expires: (number) expiration timestamp || false,
//     data: (object) data to save to local storage
// })
// Methods:
// get(): get data from local storage
// set({ data, expires }): save data to local storage
//   - data: (object) data to save to local storage
//   - expires: (number) expiration timestamp
// check(): check if data is expired
// delete(): delete data from local storage
// addTime(time): add time to expiration time
//   - time: (number) time to add in milliseconds
// Example:
// const localData = new LocalData({
//     id: 'myData',
//     expires: Date.now() + 1000 * 60 * 60 * 24, // 1 day
//     data: {
//         name: 'John',
//         age: 30,
//     }
// });
// localData.set(); // save data to local storage
// const data = localData.get(); // get data from local storage


class LocalData {
    constructor({ id, data, expires } = {}) {
        this.id = id;
        this.data = data;
        this.expires = expires || false;
    }

    // get data from local storage
    get() {
        let loadedData = localStorage.getItem(this.id);
        if (loadedData) {
            const { data, expires } = JSON.parse(loadedData);
            this.data = data;
            this.expires = expires;
            this.check();
        }
        return this.data;
    }

    // save data to local storage
    set({ id, data, expires } = {}) {
        if (id) this.id = id;
        if (data) this.data = data;
        if (expires) this.expires = expires;
        if (this.expires) {
            this.expires = this.formatExpires(this.expires);
        }

        localStorage.setItem(this.id, JSON.stringify({
            data: this.data,
            expires: this.expires
        }));
        return true;
    }

    // check if data is expired
    check() {
        if (!this.data) return false;

        if (this.expires === false || this.expires > Date.now()) {
            return true;
        }

        this.remove();
        return false;
    }

    // delete data from local storage
    remove() {
        this.data = null;
        localStorage.removeItem(this.id);
    }

    // add time to expiration time
    addTime(time) {
        this.expires = (this.expires === false ? Date.now() : this.expires) + time;
        this.set();
    }

    formatExpires(expires) {
        // check expire format to support '1s', '1m', '1h', '1d', '1w', '1M', '1y', or timestamp
        if (typeof expires === 'string') {
            const value = parseInt(expires.slice(0, -1));
            const unit = expires.slice(-1);
            // console.log(value, unit);
         
            if (isNaN(value)) {
                throw new Error('Invalid expiration time');
            }

            switch (unit) {
                case 's': expires = value * 1000; break;
                case 'm': expires = value * 1000 * 60; break;
                case 'h': expires = value * 1000 * 60 * 60; break;
                case 'd': expires = value * 1000 * 60 * 60 * 24; break;
                case 'w': expires = value * 1000 * 60 * 60 * 24 * 7; break;
                case 'M': expires = value * 1000 * 60 * 60 * 24 * 30; break;
                case 'y': expires = value * 1000 * 60 * 60 * 24 * 365; break;
                default: throw new Error('Invalid expiration time');
            }

            expires = Date.now() + expires;
        }
        // check if date
        else if (expires instanceof Date) {
            expires = expires.getTime();
        }
        else if (typeof expires === 'number') {
            expires = parseInt(expires);
        }
        else {
            throw new Error('Invalid expiration time');
        }

        return expires;
    }
}

export default LocalData;