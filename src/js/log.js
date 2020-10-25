import EventBus from './event-bus';

class Log {
  constructor() {
    this.size = 20;
    this.messages = []
  }

  _write(level, msg, data) {
    const o = {
      level: level,
      msg: msg
    };

    if (data) {
      o.data = JSON.parse(JSON.stringify(data));
    }
    console.log(o);
    //eslint-disable-next-line no-undef
    //Vue.emit('console', o);
    EventBus.emit('console', o);
    this.messages.push(o);
    if (this.messages.length > this.size) {
      this.messages.shift();
    }
  }

  debug(msg, data) {
    this._write('DEBUG', msg, data);
  }
}

const log = new Log();
export default log;