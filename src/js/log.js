import EventBus from './event-bus';

const LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
};

const loggers = {};

class Log {
  /**
   * Constructor
   * @param {string} name 
   */
  constructor(name, eventType) {
    this.name = name || 'root';
    this.eventType = eventType || 'console';
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
      output += ' ' + JSON.stringify(data);
    }
    return output;
  }

  /**
   * Gets a new logger
   * @param {string} name 
   * @returns {Log} - Log
   */
  get(name) {
    if (!(name in loggers)) {
      loggers[name] = new Log(name, this.eventType);
    }
    return loggers[name];
  }

  /**
   * Writes a log line
   * @param {string} level 
   * @param {string} msg 
   * @param {Object} data 
   */
  write(level, msg, data) {
    const output = this.format(level, msg, data)
    console.log(output);
    EventBus.emit(this.eventType, { data: output });
  }

  /**
   * Debug
   * @param {string} msg 
   * @param {Object} data 
   */
  debug(msg, data) {
    this.write(LEVELS.DEBUG, msg, data);
  }

  /**
   * Error
   * @param {string} msg 
   * @param {Object} data 
   */
  error(msg, data) {
    this.write(LEVELS.ERROR, msg, data);
  }

  /**
   * Info
   * @param {string} msg 
   * @param {Object} data 
   */
  info(msg, data) {
    this.write(LEVELS.INFO, msg, data);
  }

  /**
   * Warning
   * @param {string} msg 
   * @param {Object} data 
   */
  warn(msg, data) {
    this.write(LEVELS.WARNING, msg, data);
  }
}

const log = new Log();
export default log;