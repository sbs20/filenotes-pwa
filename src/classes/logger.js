const SIZE = 128;

const singleton = {
  /** @type {Array.<string>} */
  messages: [],

  /** @type {Object.<string, Logger>} */
  loggers: {},

  /** @type {function(string):void} */
  subscriber: null
};

export default class Logger {
  /**
   * Constructor
   * @param {string} name 
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Formats a log line
   * @param {string} level 
   * @param {string} msg 
   * @param {Object} data 
   */
  format(level, msg, data) {
    const now = new Date().toISOString();
    let output = `${now} ${level} ${this.name}: ${msg}`;
    if (data) {
      output += ' | ' + JSON.stringify(data, null, 1);
    }
    return output;
  }

  /**
   * Writes a log line
   * @param {string} level 
   * @param {string} msg 
   * @param {Object} data 
   */
  write(level, msg, data) {
    const output = this.format(level, msg, data);
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
   * @param {string} msg 
   * @param {Object} data 
   */
  debug(msg, data) {
    this.write(Logger.levels.DEBUG, msg, data);
  }

  /**
   * Error
   * @param {string} msg 
   * @param {Object} data 
   */
  error(msg, data) {
    this.write(Logger.levels.ERROR, msg, data);
  }

  /**
   * Info
   * @param {string} msg 
   * @param {Object} data 
   */
  info(msg, data) {
    this.write(Logger.levels.INFO, msg, data);
  }

  /**
   * Warning
   * @param {string} msg 
   * @param {Object} data 
   */
  warn(msg, data) {
    this.write(Logger.levels.WARNING, msg, data);
  }

  /**
   * Gets a new logger
   * @param {string} name 
   * @returns {Logger} - Log
   */
  static get(name) {
    name = name || 'root';
    if (!(name in singleton.loggers)) {
      singleton.loggers[name] = new Logger(name);
    }
    return singleton.loggers[name];
  }

  /**
   * @returns {Object.<string, string>}
   */
  static get levels() {
    return {
      DEBUG: 'DEBUG',
      INFO: 'INFO',
      WARNING: 'WARNING',
      ERROR: 'ERROR'
    };
  }

  /**
   * @returns {Array.<string>}
   */
  static get messages() {
    return singleton.messages;
  }

  /**
   * @param {function(string):void} subscriber
   */
  static set subscriber(subscriber) {
    singleton.subscriber = subscriber;
  }
}
