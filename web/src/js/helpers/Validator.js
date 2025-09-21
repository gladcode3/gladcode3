class Validator {
    static instanceof(value, Class, { varName = null }) {
        if (!value instanceof Class) {
            console.error(`${varName || value} is not an instance of ${Class.name}`);
            throw new TypeError(`${varName || value} is not an instance of ${Class.name}`);
        }
    }
}

export default Validator;
