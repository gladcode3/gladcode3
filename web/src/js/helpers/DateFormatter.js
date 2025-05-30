import Validator from "./Validator";

class DateFormatter {
    static formatAs(format = null, date) {
        Validator.instanceof(date, Date, { varName: 'date' });

        const formatPattern = format || '%D/%M/%Y - %H:%m';

        return formatPattern
            .replaceAll('%Y', date.getFullYear())
            .replaceAll('%M', (date.getMonth() + 1).toString().padStart(2, '0'))
            .replaceAll('%D', date.getDate().toString().padStart(2, '0'))
            .replaceAll('%H', date.getHours().toString().padStart(2, '0'))
            .replaceAll('%m', date.getMinutes().toString().padStart(2, '0'));
    }

    static getTimeAgo(date) {
        Validator.instanceof(date, Date, { varName: 'date' });

        const SEPARATOR = ' ';
        const FORMAT = `%D${SEPARATOR}%M${SEPARATOR}%Y${SEPARATOR}%H${SEPARATOR}%m`;

        const formattedCurrentDate = DateFormatter.formatAs(FORMAT, new Date()).split(SEPARATOR).toReversed();
        const formattedParamDate = DateFormatter.formatAs(FORMAT, date).split(SEPARATOR).toReversed();

        const TIMESTAMP_PARTS = ['ano', 'mês', 'dia', 'hora', 'minuto'];

        for (const i in TIMESTAMP_PARTS) {
            const currentPart = formattedCurrentDate[i];
            const paramPart = formattedParamDate[i];

            const timeAgoCalc = currentPart - paramPart;

            if (timeAgoCalc === 0) continue;
            if (timeAgoCalc === 1) return `Há 1 ${TIMESTAMP_PARTS[i]} atrás`;

            if (timeAgoCalc > 1) {
                const toPlural = TIMESTAMP_PARTS[i] === "mês" ? 'meses' : `${TIMESTAMP_PARTS[i]}s`;
                return `Há ${timeAgoCalc} ${toPlural} atrás`;
            }
        }

        return 'Agora mesmo';
    }
}

export default DateFormatter;
