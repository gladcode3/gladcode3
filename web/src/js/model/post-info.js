class PostInfo {
    constructor({ id, title, time, post }) {
        this.id = id;
        this.title = title;
        this.body = post;

        const timeDate = new Date(time);
        this.time = this.#formatDate(timeDate);
    }

    #formatDate(time) {
        if (!time instanceof Date) {
            console.error('time is not an instance of Date');
            throw new TypeError('time is not an instance of Date');
        }

        const formattedDate = {
            year: time.getFullYear(),
            month: time.getMonth(),
            day: time.getDate(),
            hours: time.getHours(),
            minutes: time.getMinutes(),
            seconds: time.getSeconds(),
            milliseconds: time.getMilliseconds()
        };

        return formattedDate;
    }
}

export default PostInfo;
