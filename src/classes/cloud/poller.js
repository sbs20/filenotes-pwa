import Logger from '../logger';
const log = Logger.get('Poller');

export default class Poller {
  /**
   * @param {Window} window 
   * @param {import('../context').default} context
   * @param {number} timeout Timeout in seconds
   */
  constructor(window, context, timeout) {
    this.window = window;
    this.context = context;
    this.timeout = timeout;
    this.next = 0;
    this.running = false;
  }

  _delay() {
    return 60 * 1000 * (1 + Math.random());
  }

  readyIn() {
    return Math.max(0, this.next - Date.now());
  }

  get provider() {
    return this.context.remote;
  }

  /**
   * @returns {Promise.<boolean>}
   */
  async run() {
    if (!this.provider) {
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
      this.provider.abort();
      aborted = true;
    }, this.timeout * 1000);

    log.debug('listening');
    try {
      const changes = await this.provider.poll();
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