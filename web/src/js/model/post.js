class PostModel {
    constructor({ id, post, time, title }) {
        this.id = id;
        this.title = title;
        this.body = post;

        const timeDate = new Date(time);

        this.time = {
            year: timeDate.getFullYear(),
            month: timeDate.getMonth(),
            day: timeDate.getDate(),
            hours: timeDate.getHours(),
            minutes: timeDate.getMinutes(),
            seconds: timeDate.getSeconds(),
            milliseconds: timeDate.getMilliseconds()
        };
    };
};

export default PostModel;
