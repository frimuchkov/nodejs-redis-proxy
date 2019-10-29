import { expect, assert } from 'chai';
import {DoublyLinkedList, LruCache} from "../src/modules/lruCache";


describe('Cache tests', () => {
    describe ('Doubly linked list', () => {
        const testKeys = ['key1', 'key2', 'key3'];
        const testValues = ['value1', 'value2', 'value3'];

        it ('Should add element to empty list', () => {
            const list = new DoublyLinkedList<string>();
            expect(list.tail).to.be.an('undefined');
            expect(list.head).to.be.an('undefined');
            list.add(testKeys[0], testValues[0]);

            expect(list.size).to.be.eq(1);
            expect(Object.keys(list.keyMap).length).to.be.eq(1);
            const tail = list.tail;
            if (tail == null) {
                assert(false, 'Tail is undefined');
                return;
            }
            expect(list.tail).to.be.eq(list.head);
            expect(tail.key).to.be.eq(testKeys[0]);
            expect(tail.value).to.be.eq(testValues[0]);
        });

        it ('Should remove element from list', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);
            list.remove(testKeys[0]);

            expect(list.size).to.be.eq(0);
            expect(list.tail).to.be.an('undefined');
            expect(list.head).to.be.an('undefined');
            expect(Object.keys(list.keyMap).length).to.be.eq(0);
        });

        it ('Should get element from list', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);
            const element = list.get(testKeys[0]);

            expect(element).to.be.eq(testValues[0]);

            const nonExistentElement = list.get('nonExistent');
            expect(nonExistentElement).to.be.an('null');
        });

        it ('Should correct update head and tail after adding element to list with one element', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);

            expect(list.size).to.be.eq(2);

            expect(list.tail!.key).to.be.eq(testKeys[0]);
            expect(list.head!.key).to.be.eq(testKeys[1]);
        });

        it ('Should correct update head and tail after adding element to list with two element', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            expect(list.size).to.be.eq(3);

            expect(list.tail!.key).to.be.eq(testKeys[0]);
            expect(list.head!.key).to.be.eq(testKeys[2]);

            expect(list.head!.next).to.be.eq(list.keyMap[testKeys[1]]);
            expect(list.tail!.previous).to.be.eq(list.keyMap[testKeys[1]]);
        });

        it ('Should remove head element', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.removeHeadElement();
            expect(list.size).to.be.eq(2);

            expect(list.tail!.key).to.be.eq(testKeys[0]);
            expect(list.head!.key).to.be.eq(testKeys[1]);

            expect(list.head!.next).to.be.eq(list.tail);
            expect(list.tail!.previous).to.be.eq(list.head);
        });

        it ('Should remove tail element', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.removeTailElement();
            expect(list.size).to.be.eq(2);

            expect(list.tail!.key).to.be.eq(testKeys[1]);
            expect(list.head!.key).to.be.eq(testKeys[2]);

            expect(list.head!.next).to.be.eq(list.tail);
            expect(list.tail!.previous).to.be.eq(list.head);
        });

        it ('Should remove element from chain element', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.remove(testKeys[1]);
            expect(list.size).to.be.eq(2);

            expect(list.tail!.key).to.be.eq(testKeys[0]);
            expect(list.head!.key).to.be.eq(testKeys[2]);
        });

        it ('Should not remove nonexistent element', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);

            list.remove('unExistent');
            expect(list.size).to.be.eq(1);

            list.remove(testKeys[0]);
            expect(list.size).to.be.eq(0);
            list.removeHeadElement();
            list.removeTailElement();
        });

        it ('Should lift tail', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.lift(testKeys[0]);
            expect(list.size).to.be.eq(3);
            expect(list.head!.key).to.be.eq(testKeys[0]);
            expect(list.tail!.key).to.be.eq(testKeys[1]);
        });

        it ('Should lift head', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.lift(testKeys[2]);
            expect(list.size).to.be.eq(3);
            expect(list.head!.key).to.be.eq(testKeys[2]);
        });

        it ('Should lift element from chain', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);
            list.add(testKeys[1], testValues[1]);
            list.add(testKeys[2], testValues[2]);

            list.lift(testKeys[1]);
            expect(list.size).to.be.eq(3);
            expect(list.head!.key).to.be.eq(testKeys[1]);
            expect(list.tail!.key).to.be.eq(testKeys[0]);
        });

        it ('Should lift element in empty chain', () => {
            const list = new DoublyLinkedList<string>();
            list.lift(testKeys[0]);

            expect(list.size).to.be.eq(0);
        });

        it ('Should lift nonexistent element chain', () => {
            const list = new DoublyLinkedList<string>();
            list.add(testKeys[0], testValues[0]);
            list.lift(testKeys[1]);

            expect(list.size).to.be.eq(1);
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
            await new Promise(resolve => setTimeout(resolve, 100));
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
