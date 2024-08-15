// Custom error class
export default class CustomError extends Error {
    constructor(code, message, data) {
        super(message);
        this.code = code;
        this.data = data;
    }
}