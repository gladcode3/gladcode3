class DateFormatter {
    static formatAs(format = null, date) {
        if (!date instanceof Date) {
            console.error('date is not an instance of Date');
            throw new TypeError('date is not an instance of Date');
        }

        const formatPattern = format || '%D/%M/%Y - %H:%m';

        return formatPattern
            .replaceAll('%Y', date.getFullYear())
            .replaceAll('%M', (date.getMonth() + 1).toString().padStart(2, '0'))
            .replaceAll('%D', date.getDate().toString().padStart(2, '0'))
            .replaceAll('%H', date.getHours().toString().padStart(2, '0'))
            .replaceAll('%m', date.getMinutes().toString().padStart(2, '0'));
    }
}

export default DateFormatter;
