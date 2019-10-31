import { expect, assert } from 'chai';
import {DoublyLinkedListWithMap, LruCache} from '../src/modules/lruCache';


describe('Cache tests', () => {
    describe ('Doubly linked list', () => {
        const testKeys = ['key1', 'key2', 'key3'];
        const testValues = ['value1', 'value2', 'value3'];

        it ('Should add element to empty list', () => {
            const list = new DoublyLinkedListWithMap<string>();
            expect(list.getTail()).to.be.an('undefined');
            expect(list.getHead()).to.be.an('undefined');
            list.add(testKeys[0], testValues[0]);

            expect(list.getSize()).to.be.eq(1);
            expect(Object.keys((list as any).keyMap).length).to.be.eq(1);
            const tail = list.getTail();
            if (tail == null) {
                assert(false, 'Tail is undefined');
                return;
            }
            expect(list.getTail()).to.be.eq(list.getHead());
            expect(tail.key).to.be.eq(testKeys[0]);
            expect(tail.value).to.be.eq(testValues[0]);
        });

        it ('Should remove element from list', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);
            list.remove(testKeys[0]);

            expect(list.getSize()).to.be.eq(0);
            expect(list.getTail()).to.be.an('undefined');
            expect(list.getHead()).to.be.an('undefined');
            expect(Object.keys((list as any).keyMap).length).to.be.eq(0);
        });

        it ('Should get element from list', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);
            const element = list.get(testKeys[0]);

            expect(element).to.be.eq(testValues[0]);

            const nonExistentElement = list.get('nonExistent');
            expect(nonExistentElement).to.be.an('null');
        });

        it ('Should correct update head and tail after adding element to list with one element', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);

            expect(list.getSize()).to.be.eq(2);

            expect(list.getTail()!.key).to.be.eq(testKeys[0]);
            expect(list.getHead()!.key).to.be.eq(testKeys[1]);
        });

        it ('Should correct update head and tail after adding element to list with two element', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            expect(list.getSize()).to.be.eq(3);

            expect(list.getTail()!.key).to.be.eq(testKeys[0]);
            expect(list.getHead()!.key).to.be.eq(testKeys[2]);

            expect(list.getHead()!.next).to.be.eq((list as any).keyMap[testKeys[1]]);
            expect(list.getTail()!.previous).to.be.eq((list as any).keyMap[testKeys[1]]);
        });

        it ('Should remove head element', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.removeHeadElement();
            expect(list.getSize()).to.be.eq(2);

            expect(list.getTail()!.key).to.be.eq(testKeys[0]);
            expect(list.getHead()!.key).to.be.eq(testKeys[1]);

            expect(list.getHead()!.next).to.be.eq(list.getTail());
            expect(list.getTail()!.previous).to.be.eq(list.getHead());
        });

        it ('Should remove tail element', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.removeTailElement();
            expect(list.getSize()).to.be.eq(2);

            expect(list.getTail()!.key).to.be.eq(testKeys[1]);
            expect(list.getHead()!.key).to.be.eq(testKeys[2]);

            expect(list.getHead()!.next).to.be.eq(list.getTail());
            expect(list.getTail()!.previous).to.be.eq(list.getHead());
        });

        it ('Should remove element from chain element', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.remove(testKeys[1]);
            expect(list.getSize()).to.be.eq(2);

            expect(list.getTail()!.key).to.be.eq(testKeys[0]);
            expect(list.getHead()!.key).to.be.eq(testKeys[2]);
        });

        it ('Should not remove nonexistent element', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);

            list.remove('unExistent');
            expect(list.getSize()).to.be.eq(1);

            list.remove(testKeys[0]);
            expect(list.getSize()).to.be.eq(0);
            list.removeHeadElement();
            list.removeTailElement();
        });

        it ('Should lift tail', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.lift(testKeys[0]);
            expect(list.getSize()).to.be.eq(3);
            expect(list.getHead()!.key).to.be.eq(testKeys[0]);
            expect(list.getTail()!.key).to.be.eq(testKeys[1]);
        });

        it ('Should lift head', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.lift(testKeys[2]);
            expect(list.getSize()).to.be.eq(3);
            expect(list.getHead()!.key).to.be.eq(testKeys[2]);
        });

        it ('Should lift element from chain', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.lift(testKeys[1]);
            expect(list.getSize()).to.be.eq(3);
            expect(list.getHead()!.key).to.be.eq(testKeys[1]);
            expect(list.getTail()!.key).to.be.eq(testKeys[0]);
        });

        it ('Should lift element in empty chain', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.lift(testKeys[0]);

            expect(list.getSize()).to.be.eq(0);
        });

        it ('Should lift nonexistent element chain', () => {
            const list = new DoublyLinkedListWithMap<string>();
            list.add(testKeys[0], testValues[0]);
            list.lift(testKeys[1]);

            expect(list.getSize()).to.be.eq(1);
        });
    });
    describe ('LRU cache', () => {
        const testKeys = ['key1', 'key2', 'key3'];
        const testValues = ['value1', 'value2', 'value3'];
        it ('Should add element', () => {
            const cache = new LruCache<string>();
            cache.set(testKeys[0], testValues[0]);
            expect(cache.get(testKeys[0])).to.be.eq(testValues[0]);
        });

        it ('Should add existent element', () => {
            const cache = new LruCache<string>();
            cache.set(testKeys[0], testValues[0]);
            expect(cache.get(testKeys[0])).to.be.eq(testValues[0]);
            cache.set(testKeys[0], testValues[0]);
            expect(cache.get(testKeys[0])).to.be.eq(testValues[0]);
        });

        it ('Should not give expired element', async () => {
            const cache = new LruCache<string>(10, 100);
            cache.set(testKeys[0], testValues[0]);
            await new Promise(resolve => setTimeout(resolve, 110));
            expect(cache.get(testKeys[0])).to.be.an('null');
        });

        it ('Should remove element after exceed capacity', async () => {
            const cache = new LruCache<string>(1);
            cache.set(testKeys[0], testValues[0]);
            cache.set(testKeys[1], testValues[1]);

            expect(cache.get(testKeys[1])).to.be.eq(testValues[1]);
            expect(cache.get(testKeys[0])).to.be.an('null');
        });

        it ('Should lift element after get', async () => {
            const cache = new LruCache<string>(2);
            cache.set(testKeys[0], testValues[0]);
            cache.set(testKeys[1], testValues[1]);

            cache.get(testKeys[0]);

            cache.set(testKeys[2], testValues[2]);

            expect(cache.get(testKeys[0])).to.be.eq(testValues[0]);
            expect(cache.get(testKeys[1])).to.be.an('null');
        });

        it ('Should not set element if zero capacity', async () => {
            const cache = new LruCache<string>(0);
            cache.set(testKeys[0], testValues[0]);
            expect(cache.get(testKeys[0])).to.be.an('null');
        });
    });
});
