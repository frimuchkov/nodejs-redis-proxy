declare class DoublyLinkedListElement<T extends any> {
    value: T;
    key: string;
    previous: DoublyLinkedListElement<T> | undefined;
    next: DoublyLinkedListElement<T> | undefined;
    constructor(key: string, value: T);
}
export declare class DoublyLinkedList<T extends any> {
    size: number;
    head: DoublyLinkedListElement<T> | undefined;
    tail: DoublyLinkedListElement<T> | undefined;
    keyMap: {
        [key: string]: DoublyLinkedListElement<T>;
    };
    private removeFromChain;
    lift(key: string): void;
    remove(key: string): void;
    add(key: string, value: T): void;
    get(key: string): T | null;
    removeTailElement(): void;
    removeHeadElement(): void;
}
interface LruValue<T> {
    value: T;
    expiredTime: number;
}
export declare class LruCache<T extends any> {
    capacity: number;
    ttl: number;
    list: DoublyLinkedList<LruValue<T>>;
    /**
     *
     * @param capacity
     * @param ttl TTL in ms
     */
    constructor(capacity?: number, ttl?: number);
    get(key: string): T | null;
    set(key: string, value: T): void;
}
export {};
