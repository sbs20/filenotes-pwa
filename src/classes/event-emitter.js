/**
 * @typedef {import('../typedefs/types').Event} Event
 */
export default class EventEmitter {
  constructor() {
    this.listeners = {};
    this.lastId = 0;
  }

  /**
   * 
   * @param {string} eventType - The event type
   * @param {function(Event):void|number} [data] - The event handler
   */
  off(eventType, data) {
    if (data === undefined) {
      delete this.listeners[eventType];
    } else if (typeof(data) === 'number') {
      const id = data;
      delete this.listeners[eventType][id];
      if (Object.keys(this.listeners[eventType]).length === 0) {
        delete this.listeners[eventType];
      }
    } else if (typeof(data) === 'function') {
      // TODO     
    }
  }

  /**
   * 
   * @param {string} eventType - The event type
   * @param {function(Event):void} callback - The event handler
   */
  on(eventType, callback) {
    const id = ++this.lastId;
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = {};
    }

    this.listeners[eventType][id] = callback;
    return {
      remove: () => {
        this.off(eventType, id);
      }
    };
  }

  /**
   * Emits an event
   * @param {string} eventType - The event type
   * @param {Event} event - The event
   */
  emit(eventType, event) {
    if (!this.listeners[eventType]) {
      return;
    }
    Object.keys(this.listeners[eventType]).forEach(id => this.listeners[eventType][id](event));
  }
}
