import Context from '../context';
import Logger from '../logger';
const log = Logger.get('Poller');

export default class Poller {
  window: Window;
  context: Context;
  timeout: number;
  next: number;
  running: boolean;

  constructor(window: Window, context: Context, timeout: number) {
    this.window = window;
    this.context = context;
    this.timeout = timeout;
    this.next = 0;
    this.running = false;
  }

  _delay(): number {
    return 60 * 1000 * (1 + Math.random());
  }

  readyIn(): number {
    return Math.max(0, this.next - Date.now());
  }

  async run(): Promise<boolean> {
    const provider = this.context.remote;
    if (!provider) {
      this.next = Date.now() + this._delay();
      return false;
    }

    if (this.running || this.next > Date.now()) {
      return false;
    }

    let aborted = false;
    this.running = true;

    const timer = this.window.setTimeout(() => {
      log.debug('abort');
      provider.abort();
      aborted = true;
    }, this.timeout * 1000);

    log.debug('listening');
    try {
      const changes = await provider.poll();
      log.debug(`changes: ${changes}`);
      this.next = Date.now();
      return changes;

    } catch (reason) {
      log.debug(`error: ${reason}`);
      this.next = Date.now();
      if (!aborted) {
        this.next = Date.now() + this._delay();
      }
      return false;

    } finally {
      this.running = false;
      this.window.clearTimeout(timer);
    }
  }
}