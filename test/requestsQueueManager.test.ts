import * as chai from 'chai';
import chaiSpies = require('chai-spies');
import {RequestQueueManager} from '../src/modules/requestQueueManager';
import logger from '../src/libs/logger';
import {ProxyErrors} from '../src/libs/proxyErrors';

chai.use(chaiSpies);

const { expect } = chai;


describe('Requests queue manager tests', () => {
  it ('Should process sync task', (done) => {
    const queueManager = new RequestQueueManager(1, 10);
    queueManager.executeRequest(() => {
      done();
    });
  });

  it ('Should process async task', (done) => {
    const queueManager = new RequestQueueManager(1, 10);
    queueManager.executeRequest(async () => {
      await new Promise(resolve => setTimeout((resolve), 10));
      done();
    });
  });

  describe ('Tests catch errors', () => {
    let call: (...args: any[]) => any = () => {};
    let loggerError: (...args: any[]) => any;
    before('Mock logger', () => {
      loggerError = logger.error;
      logger.error = (...args: any[]) => call(...args);
    });


    it ('Should catch sync error', async () => {
      const spy = chai.spy();
      call = spy;
      const queueManager = new RequestQueueManager(1, 10);
      queueManager.executeRequest(() => {
        throw new Error();
      });
      await new Promise(resolve => setTimeout((resolve), 50));
      expect(spy).have.been.called.exactly(1);
    });

    it ('Should catch async error', async () => {
      const spy = chai.spy();
      call = spy;
      const queueManager = new RequestQueueManager(1, 10);
      queueManager.executeRequest(async () => {
        await new Promise((resolve, reject) => setTimeout(() => reject('Some error'), 10));
      });
      await new Promise(resolve => setTimeout((resolve), 50));
      expect(spy).have.been.called.exactly(1);
    });

    after('Restore logger', () => {
      logger.error = loggerError;
    })
  });


  it ('Should queue tasks', async () => {
    const queueManager = new RequestQueueManager(2, 10);
    const results: any[] = [];

    const tasksResolvers: (() => any)[] = [];
    queueManager.executeRequest(async () => {
      await new Promise(resolve => tasksResolvers.push(resolve));
      results.push(1);
    });

    queueManager.executeRequest(async () => {
      await new Promise(resolve => tasksResolvers.push(resolve));
      results.push(2);
    });

    queueManager.executeRequest(async () => {
      await new Promise(resolve => tasksResolvers.push(resolve));
      results.push(3);
    });

    await new Promise(resolve => setTimeout((resolve), 1));

    expect(results.length).to.be.eq(0);

    expect(queueManager.getQueue()).to.be.eq(1);
    expect(queueManager.getActive()).to.be.eq(2);

    // Execute first
    tasksResolvers.shift()!();
    await new Promise(resolve => setTimeout((resolve), 1));
    expect(results[0]).to.be.eq(1);

    expect(queueManager.getQueue()).to.be.eq(0);
    expect(queueManager.getActive()).to.be.eq(2);

    // Execute second
    tasksResolvers.shift()!();
    await new Promise(resolve => setTimeout((resolve), 1));
    expect(results[1]).to.be.eq(2);
    expect(queueManager.getQueue()).to.be.eq(0);
    expect(queueManager.getActive()).to.be.eq(1);

    // Execute third
    tasksResolvers.shift()!();
    await new Promise(resolve => setTimeout((resolve), 1));
    expect(results[2]).to.be.eq(3);
    expect(queueManager.getQueue()).to.be.eq(0);
    expect(queueManager.getActive()).to.be.eq(0);
  });

  it ('Should throw error when exceeded max requests', async () => {
    const queueManager = new RequestQueueManager(1, 1);
    let resolver: () => void = () => {};
    queueManager.executeRequest(async () => {
      await new Promise(resolve => {
        resolver = resolve;
      })});

    expect(() => queueManager.executeRequest(() => {})).to.throw(ProxyErrors.MAX_CONNECTIONS_EXCEEDED);
    resolver();
  });
});
