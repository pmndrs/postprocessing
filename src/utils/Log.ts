import { LogLevel } from "../enums/LogLevel.js";

/**
 * A simple logging helper.
 *
 * @group Utils
 */

export abstract class Log {

	/**
	 * The current log level. Default is {@link LogLevel.ERROR}.
	 */

	static level = LogLevel.ERROR;

	/**
	 * Logs an error message.
	 *
	 * @param data - The data to log.
	 */

	static error(...data: unknown[]): void {

		if(Log.level >= LogLevel.ERROR) { console.error(...data); }

	}

	/**
	 * Logs a warning message.
	 *
	 * @param data - The data to log.
	 */

	static warn(...data: unknown[]): void {

		if(Log.level >= LogLevel.WARN) { console.warn(...data); }

	}

	/**
	 * Logs an info message.
	 *
	 * @param data - The data to log.
	 */

	static info(...data: unknown[]): void {

		if(Log.level >= LogLevel.INFO) { console.log(...data); }

	}

	/**
	 * Logs a debug message.
	 *
	 * @param data - The data to log.
	 */

	static debug(...data: unknown[]): void {

		if(Log.level >= LogLevel.DEBUG) { console.debug(...data); }

	}

	/**
	 * Starts a log message group.
	 */

	static group(): void { console.group(); }

	/**
	 * Finishes the current log message group.
	 */

	static groupEnd(): void { console.groupEnd(); }

	/**
	 * Logs a debug message.
	 */

	static trace(data?: unknown): void { console.trace(data); }

}
