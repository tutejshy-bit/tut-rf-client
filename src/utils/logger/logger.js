import {emitter} from "@/utils/notifications/events";
import {consoleLogger, setConsoleLevel, setReportLevel} from './adapter/console'
import {LogLevel} from "./types";

setConsoleLevel(LogLevel.DEBUG);
emitter.on('channel-success', (eventData) => consoleLogger.info(eventData.type ?? '', eventData.message, eventData.data));
emitter.on('channel-info', (eventData) => consoleLogger.info(eventData.type ?? '', eventData.message, eventData.data));
emitter.on('channel-error', (eventData) => consoleLogger.error(eventData.type ?? '', eventData.message, eventData.data))
emitter.on('channel-warn', (eventData) => consoleLogger.warn(eventData.type ?? '', eventData.message, eventData.data))
emitter.on('channel-debug', (eventData) => consoleLogger.debug(eventData.type ?? '', eventData.message, eventData.data))