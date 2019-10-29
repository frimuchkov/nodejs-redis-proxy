class DoublyLinkedListElement<T extends any> {
    value: T;
    key: string;
    previous: DoublyLinkedListElement<T> | undefined;
    next: DoublyLinkedListElement<T> | undefined;
    constructor (key: string, value: T) {
        this.key = key;
        this.value = value;
    }
}

export class DoublyLinkedListWithMap<T extends any> {
    private size: number = 0;
    private head: DoublyLinkedListElement<T> | undefined;
    private tail: DoublyLinkedListElement<T> | undefined;
    private keyMap: {[key: string]: DoublyLinkedListElement<T>} = {};

    getSize() {
        return this.size;
    }

    getTail() {
        return this.tail;
    }

    getHead() {
        return this.head;
    }

    private removeFromChain(element: DoublyLinkedListElement<T>) {
        if (element.previous) {
            element.previous.next = element.next;
        }

        if (element.next) {
            element.next.previous = element.previous;
        }
    }

    lift(key: string) {
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

    remove(key: string) {
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

    add(key: string, value: T) {
        const element = new DoublyLinkedListElement(key, value);
        element.previous = undefined;
        element.next = this.head;
        if (this.head != null) {
            this.head.previous = element;
        }

        this.head = element;

        if (this.tail == null) {
            this.tail = element
        }

        this.keyMap[key] = element;

        this.size += 1;
    }

    get(key: string): T | null {
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

interface LruValue<T> {
    value: T,
    expiredTime: number,
}

export class LruCache<T extends any> {
    capacity: number = 0;
    ttl: number = 0;
    list: DoublyLinkedListWithMap<LruValue<T>>;
    /**
     *
     * @param capacity
     * @param ttl TTL in ms
     */
    constructor(capacity: number = 10, ttl: number = 1000) {
        this.capacity = capacity;
        this.ttl = ttl;
        this.list = new DoublyLinkedListWithMap<LruValue<T>>();
    }

    get(key: string): T | null {
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

    set(key: string, value: T) {
        if (this.capacity === 0) {
            return;
        }

        this.list.remove(key);
        if (this.list.getSize() === this.capacity) {
            this.list.removeTailElement();
        }
        this.list.add(key, {
            value,
            expiredTime: Date.now() + this.ttl,
        });
    }
}
