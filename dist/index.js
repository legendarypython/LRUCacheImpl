export var CacheStrategy;
(function (CacheStrategy) {
    CacheStrategy[CacheStrategy["LRUStrat"] = 0] = "LRUStrat";
    CacheStrategy[CacheStrategy["MRUStrat"] = 1] = "MRUStrat";
})(CacheStrategy || (CacheStrategy = {}));
export class CapacityManagerFactory {
    static getCapacityManager(capacity) {
        return new CapacityManager(capacity);
    }
}
export class LRUCache {
    manager;
    constructor(managerMap, strategy) {
        const manager = managerMap.get(strategy);
        if (manager != undefined)
            this.manager = manager;
        else
            throw new Error('Invalid strategy');
    }
    get(key) {
        return this.manager.get(key);
    }
    put(key, value) {
        this.manager.put(key, value);
    }
}
class DoublyLinkedList {
    key;
    value;
    next;
    prev;
    constructor(key = 0, value = "") {
        this.key = key;
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}
export class DoublyLinkedListStorage {
    head;
    tail;
    constructor(head, tail) {
        this.head = head;
        this.tail = tail;
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    deleteFromHead() {
        let temp = this.head.next;
        this.head.next = this.head.next?.next ?? null;
        if (this.head.next) {
            this.head.next.prev = this.head;
        }
        return temp;
    }
    deleteNode(temp) {
        let prev = temp.prev;
        let next = temp.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
            temp.prev = null;
            temp.next = null;
        }
    }
    addNewNode(temp) {
        let prev = this.tail.prev;
        if (prev) {
            this.tail.prev = temp;
            temp.next = this.tail;
            temp.prev = prev;
            prev.next = temp;
        }
    }
}
export class HashMapStorage {
    map;
    constructor(map) {
        this.map = map;
    }
    get(key) {
        return this.map.get(key) ?? null;
    }
    set(key, value) {
        this.map.set(key, value);
    }
    delete(key) {
        this.map.delete(key);
    }
}
export class LRUCacheManager {
    mapStorage;
    linkedListStorage;
    capacityManager;
    constructor(mapStorage, linkedListStorage, capacityManager) {
        this.mapStorage = mapStorage;
        this.linkedListStorage = linkedListStorage;
        this.capacityManager = capacityManager;
    }
    get(key) {
        let temp = this.mapStorage.get(key);
        if (temp) {
            this.linkedListStorage.deleteNode(temp);
            this.linkedListStorage.addNewNode(temp);
            this.mapStorage.set(key, temp);
            return temp.value;
        }
        else {
            return "Key is not present";
        }
    }
    put(key, value) {
        let temp = this.mapStorage.get(key);
        if (!temp) {
            if (this.capacityManager.isFull()) {
                let deletedNode = this.linkedListStorage.deleteFromHead();
                if (deletedNode)
                    this.mapStorage.delete(deletedNode.key);
            }
            else {
                this.capacityManager.decreaseCapacity();
            }
            let newNode = DoublyLinkedListFactory.createNewNode(key, value);
            this.linkedListStorage.addNewNode(newNode);
            this.mapStorage.set(key, newNode);
        }
        else {
            this.linkedListStorage.deleteNode(temp);
            temp.value = value;
            this.linkedListStorage.addNewNode(temp);
            this.mapStorage.set(key, temp);
        }
    }
}
export class CapacityManager {
    capacity;
    constructor(capacity) {
        this.capacity = capacity;
    }
    decreaseCapacity() {
        this.capacity -= 1;
    }
    isFull() {
        return this.capacity == 0;
    }
}
export class DoublyLinkedListFactory {
    static createNewNode(key, value) {
        return new DoublyLinkedList(key, value);
    }
}
//main
let map = new Map();
map.set(CacheStrategy.LRUStrat, new LRUCacheManager(new HashMapStorage(new Map()), new DoublyLinkedListStorage(DoublyLinkedListFactory.createNewNode(), DoublyLinkedListFactory.createNewNode()), CapacityManagerFactory.getCapacityManager(3)));
let lruCache = new LRUCache(map, CacheStrategy.LRUStrat);
lruCache.put(1, "Hi");
lruCache.put(2, 'Bye');
lruCache.put(3, 'Bye');
lruCache.put(4, 'Bye');
console.log(lruCache.get(2));
lruCache.put(6, 'Bye');
lruCache.put(5, 'Bye');
console.log(lruCache.get(1));
console.log(lruCache.get(4));
console.log(lruCache.get(5));
console.log(lruCache.get(2));
