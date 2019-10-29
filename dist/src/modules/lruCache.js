"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoublyLinkedListElement {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}
class DoublyLinkedList {
    constructor() {
        this.size = 0;
        this.keyMap = {};
    }
    removeFromChain(element) {
        if (element.previous) {
            element.previous.next = element.next;
        }
        if (element.next) {
            element.next.previous = element.previous;
        }
    }
    lift(key) {
        if (!this.tail && !this.head) {
            return;
        }
        const element = this.keyMap[key];
        // If element is already head, no necessary to lift
        if (element == null || element === this.head) {
            return;
        }
        this.remove(key);
        this.add(key, element.value);
    }
    remove(key) {
        const element = this.keyMap[key];
        if (element == null) {
            return;
        }
        this.size -= 1;
        if (this.head === element) {
            this.head = element.next;
        }
        if (this.tail === element) {
            this.tail = element.previous;
        }
        this.removeFromChain(element);
        delete this.keyMap[key];
    }
    add(key, value) {
        const element = new DoublyLinkedListElement(key, value);
        element.previous = undefined;
        element.next = this.head;
        if (this.head != null) {
            this.head.previous = element;
        }
        this.head = element;
        if (this.tail == null) {
            this.tail = element;
        }
        this.keyMap[key] = element;
        this.size += 1;
    }
    get(key) {
        const value = this.keyMap[key];
        if (value == null) {
            return null;
        }
        return value.value;
    }
    removeTailElement() {
        if (this.tail != null) {
            this.remove(this.tail.key);
        }
    }
    removeHeadElement() {
        if (this.head != null) {
            this.remove(this.head.key);
        }
    }
}
exports.DoublyLinkedList = DoublyLinkedList;
class LruCache {
    /**
     *
     * @param capacity
     * @param ttl TTL in ms
     */
    constructor(capacity = 10, ttl = 1000) {
        this.capacity = 0;
        this.ttl = 0;
        this.capacity = capacity;
        this.ttl = ttl;
        this.list = new DoublyLinkedList();
    }
    get(key) {
        const value = this.list.get(key);
        if (value == null) {
            return null;
        }
        if (value.expiredTime <= Date.now()) {
            this.list.remove(key);
            return null;
        }
        this.list.lift(key);
        return value.value;
    }
    set(key, value) {
        if (this.capacity === 0) {
            return;
        }
        this.list.remove(key);
        if (this.list.size === this.capacity) {
            this.list.removeTailElement();
        }
        this.list.add(key, {
            value,
            expiredTime: Date.now() + this.ttl,
        });
    }
}
exports.LruCache = LruCache;
//# sourceMappingURL=lruCache.js.map