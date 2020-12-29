const SIZE = 512;

const singleton: {
  messages: string[],
  loggers: { [name: string]: Logger },
  subscriber: null | ((message: string) => void)
} = {
  messages: [],
  loggers: {},
  subscriber: null
};

export default class Logger {
  name: string;

  /**
   * Constructor
   */
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Formats a log line
   */
  format(level: string, message: string, data?: object): string {
    const now = new Date().toISOString();
    let output = `${now} ${level} ${this.name}: ${message}`;
    if (data) {
      output += ' | ' + JSON.stringify(data, null, 1);
    }
    return output;
  }

  /**
   * Writes a log line
   */
  write(level: string, message: string, data: object): void {
    const output = this.format(level, message, data);
    console.log(output);
    singleton.messages.push(output);
    if (singleton.messages.length > SIZE) {
      singleton.messages.shift();
    }
    if (singleton.subscriber) {
      singleton.subscriber(output);
    }
  }

  /**
   * Debug
   */
  debug(message: string, data: object): void {
    this.write(Logger.levels.DEBUG, message, data);
  }

  /**
   * Error
   */
  error(message: string, data: object): void {
    this.write(Logger.levels.ERROR, message, data);
  }

  /**
   * Info
   */
  info(message: string, data: object): void {
    this.write(Logger.levels.INFO, message, data);
  }

  /**
   * Warning
   */
  warn(message: string, data: object): void {
    this.write(Logger.levels.WARNING, message, data);
  }

  /**
   * Gets a new logger
   */
  static get(name?: string): Logger {
    name = name || 'root';
    if (!(name in singleton.loggers)) {
      singleton.loggers[name] = new Logger(name);
    }
    return singleton.loggers[name];
  }

  static get levels(): { [level: string]: string } {
    return {
      DEBUG: 'DEBUG',
      INFO: 'INFO',
      WARNING: 'WARNING',
      ERROR: 'ERROR'
    };
  }

  static get messages(): string[] {
    return singleton.messages;
  }

  static set subscriber(subscriber: (message: string) => void) {
    singleton.subscriber = subscriber;
  }
}
