import {LogLevel} from "../types";

const loggerConfig = {
    consoleLevel: LogLevel.INFO,
    disableConsole: false,
    disableReport: true,
    reportFn: () => {
    },
    reportLevel: LogLevel.ERROR,
    channelNameColor: 'grey'
};

const loggerInfo = {
    debug: {
        levelCode: 2,
        levelTagColor: 'green',
    },
    error: {
        levelCode: 5,
        levelTagColor: 'red',
    },
    info: {
        levelCode: 3,
        levelTagColor: 'cornflowerblue',
    },
    trace: {
        levelCode: 1,
        levelTagColor: 'yellow',
    },
    warn: {
        levelCode: 4,
        levelTagColor: 'orange',
    },
};
const logLevels = Object.keys(loggerInfo);

const getTagStyle = (color) => "background-color: " + color + "; font-size:10px; color: white; padding: 1px 5px;";
const consoleLoggerFn = (level, name, msg, data) => {
    if (data === void 0) {
        data = '';
    }
    window.console[level]("%c" + level.toUpperCase() + "%c" + name.toUpperCase(), getTagStyle(loggerInfo[level].levelTagColor), getTagStyle(loggerConfig.channelNameColor), msg, data);
}


const log = (level, name, msg, data) => {
    if (data === void 0) {
        data = '';
    }
    if (logLevels.includes(level)) {
        const levelCode = loggerInfo[level].levelCode;
        const isAboveConsoleLevel = loggerInfo[loggerConfig.consoleLevel].levelCode <= levelCode;
        const shouldConsole = !loggerConfig.disableConsole && isAboveConsoleLevel;
        const isAboveReportLevel = loggerInfo[loggerConfig.reportLevel].levelCode <= levelCode;
        const shouldReport = !loggerConfig.disableReport && isAboveReportLevel;
        const obj = {
            data: data,
            level: level,
            msg: msg,
            name: name,
        };
        if (shouldConsole) {
            consoleLoggerFn(level, name, msg, data);
        }
        if (shouldReport) {
            loggerConfig.reportFn(obj);
        }
    } else {
      consoleLogger.error('Logger', `Invalid logger call: ${level}`, {});
    }
};

const getConsoleLevel = () => loggerConfig.consoleLevel;
const getReportLevel = () => loggerConfig.reportLevel;
const getDisableConsole = () => loggerConfig.disableConsole;
const getDisableReport = () => loggerConfig.disableReport;

const setConsoleLevel = (level) => {
    if (logLevels.includes(level)) {
        loggerConfig.consoleLevel = level;
        log(LogLevel.DEBUG, 'Logger', "Log level set to " + level);
    } else {
     log(LogLevel.ERROR, 'Logger', `Invalid log level: ${level}`);
   }
    return getConsoleLevel();
};

const setReportLevel = (level) => {
    if (logLevels.includes(level)) {
        loggerConfig.reportLevel = level;
        log(LogLevel.DEBUG, 'Logger', "Report level set to " + level);
    } else {
        log(LogLevel.ERROR, 'Logger', `Invalid report level: ${level}`);
    }
    return getReportLevel();
};

const setDisableConsole = (flag) => {
    loggerConfig.disableConsole = flag;
    return getDisableConsole();
};

const setDisableReport = (flag) => {
    loggerConfig.disableReport = flag;
    return getDisableReport();
};

const setReportFn = (fn) => {
    loggerConfig.reportFn = fn;
};

const consoleLogger = {
    debug: (name, msg, data) => log(LogLevel.DEBUG, name, msg, data),
    error: (name, msg, data) => log(LogLevel.ERROR, name, msg, data),
    info: (name, msg, data) => log(LogLevel.INFO, name, msg, data),
    trace: (name, msg, data) => log(LogLevel.TRACE, name, msg, data),
    warn: (name, msg, data) => log(LogLevel.WARN, name, msg, data),
}

export default consoleLogger

export {
    getConsoleLevel,
    getReportLevel,
    getDisableConsole,
    getDisableReport,
    setDisableReport,
    setDisableConsole,
    setReportLevel,
    setConsoleLevel,
    setReportFn,
    consoleLogger,
}


