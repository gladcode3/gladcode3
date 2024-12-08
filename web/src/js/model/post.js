class PostModel {
    constructor({ id, post, time, title }) {
        this.id = id;
        this.post = post;
        
        const fullMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

        const timeDate = new Date(time);

        this.time = {
            year: timeDate.getFullYear(),
            month: fullMonths[timeDate.getMonth()],
            day: timeDate.getDate(),
            hours: timeDate.getHours(),
            minutes: timeDate.getMinutes(),
            seconds: timeDate.getSeconds(),
            milliseconds: timeDate.getMilliseconds()
        };

        this.title = title;
    }
}

export default PostModel;