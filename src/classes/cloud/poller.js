import Logger from '../logger';
const log = Logger.get('Poller');

export default class Poller {
  /**
   * @param {Window} window 
   * @param {DropboxProvider} provider
   * @param {number} timeout Timeout in seconds
   */
  constructor(window, provider, timeout) {
    this.window = window;
    this.provider = provider;
    this.timeout = timeout;
    this.next = 0;
  }

  delay() {
    return 60 * 1000 * (1 + Math.random());
  }

  ready() {
    return this.next < Date.now();
  }

  readyIn() {
    return Math.max(0, this.next - Date.now());
  }

  /**
   * @returns {Promise.<boolean>}
   */
  async run() {
    if (this.provider && this.ready()) {
      let aborted = false;

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
          this.next = Date.now() + this.delay();
        }
        return false;

      } finally {
        this.window.clearTimeout(timer);
      }
    }

    log.debug('did not run');
    this.next = Date.now() + this.delay();
    return false;
  }
}