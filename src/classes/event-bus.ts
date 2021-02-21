import { TinyEmitter } from 'tiny-emitter';

let eventBus: EventBus | null = null;

class EventBus extends TinyEmitter {
  static instance(): EventBus {
    if (eventBus === null) {
      eventBus = new EventBus();
    }
    return eventBus;
  }
}

export default EventBus;
