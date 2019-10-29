import { DoublyLinkedListWithMap } from "./lruCache";
import logger from "../libs/logger";

interface QueueFn {
  (): any
}

export class RequestQueueManager {
  maxParallelRequests: number;
  private currentRunning: number = 0;
  private list: DoublyLinkedListWithMap<QueueFn>;

  constructor(maxParallelRequests: number) {
    this.maxParallelRequests = maxParallelRequests;
    this.list = new DoublyLinkedListWithMap<QueueFn>()
  }

  getQueue() {
    return this.list.getSize();
  }

  getActive() {
    return this.currentRunning;
  }

  executeRequest(fn: QueueFn) {
    // https://jsperf.com/node-uuid-vs-math-random
    // It seems to collision is not real case
    const randomId = (`${Date.now()}${(Math.random() * 100000000).toFixed()}`).toString();
    this.list.add(randomId, async () => {
      try {
        const res = fn();
        if (res != null && res.then != null) {
          return res
            .then(() => this.end())
            .catch((e: any) => logger.error('Error while call fn', e))
        }
      } catch (e) {
        logger.error('Error while call fn', e);
      }
      this.end();
    });
    this.callNext();
  }

  private end() {
    this.currentRunning -= 1;
    this.callNext();
  }

  private callNext() {
    let cb = this.list.getTail();
    while (this.currentRunning < this.maxParallelRequests && cb != null) {
      this.list.removeTailElement();
      this.currentRunning += 1;
      cb.value();
      cb = this.list.getTail();
    }
  }
}