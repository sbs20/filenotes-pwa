class EventBus {
  constructor() {
    this.listeners = {};
    this.lastId = 0;
  }

  _nextId() {
    return ++this.lastId;
  }

  on(eventType, callback) {
    const id = this._nextId();
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = {}
    }

    this.listeners[eventType][id] = callback;
    return {
      remove: () => {
        delete this.listeners[eventType][id]
        if (Object.keys(this.listeners[eventType]).length === 0) {
          delete this.listeners[eventType]
        }
      }
    }
  }

  emit(eventType, event) {
    if (!this.listeners[eventType]) {
      return;
    }
    Object.keys(this.listeners[eventType]).forEach(id => this.listeners[eventType][id](event));
  }
}

const eventBus = new EventBus();
export default eventBus;
