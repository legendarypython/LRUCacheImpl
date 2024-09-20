export enum CacheStrategy {

    LRUStrat, 
    MRUStrat
}

export class CapacityManagerFactory {

    static getCapacityManager(capacity: number): ICapacityManager {
        return new CapacityManager(capacity); 
    }
}


export class LRUCache {

    
    manager: CacheManager; 

    constructor(managerMap: Map<CacheStrategy, CacheManager>, strategy: CacheStrategy) {

        const manager = managerMap.get(strategy); 
        if(manager !=  undefined)
            this.manager = manager ; 
        else 
        throw new Error('Invalid strategy');         
       
    }

     get(key: number) : string{
       return this.manager.get(key);         


    }

    put(key: number, value: string)
    {

        this.manager.put(key, value); 
    }
}


class DoublyLinkedList {

    key: number; 
    value: string; 
    next: DoublyLinkedList  | null; 
    prev: DoublyLinkedList | null; 

    constructor(key: number = 0, value: string = ""){

        this.key = key; 
        this.value = value;
        this.next = null; 
        this.prev = null; 
    }
}


export interface LinkedListStorage{


    deleteNode(node: DoublyLinkedList) : void; 
    addNewNode(node: DoublyLinkedList): void; 
    deleteFromHead() : DoublyLinkedList| null; 
}

export interface MapStorage {

    get(key: number) : DoublyLinkedList | null; 
    set(key: number, value: DoublyLinkedList): void; 
    delete(key: number): void; 

}

export class DoublyLinkedListStorage implements LinkedListStorage{

    private head: DoublyLinkedList; 
    private tail: DoublyLinkedList; 

    constructor( head: DoublyLinkedList, tail: DoublyLinkedList)
    {
        this.head = head; 
        this.tail = tail; 
        this.head.next = this.tail; 
        this.tail.prev = this.head; 
    }
    deleteFromHead(): DoublyLinkedList | null {
        
        let temp = this.head.next; 
        this.head.next = this.head.next?.next ?? null; 

        if(this.head.next)
        {  
            this.head.next.prev = this.head; 
        }

        return temp; 

        
    }
    deleteNode(temp: DoublyLinkedList): void {
        let prev = temp.prev; 
        let next = temp.next; 
        if(prev && next)
        {
        prev.next = next; 
       
        next.prev = prev; 
         temp.prev = null; 
         temp.next = null;
        }
        
    }
    addNewNode(temp: DoublyLinkedList): void {
        let prev = this.tail.prev; 
        if(prev)
        {
        this.tail.prev = temp; 
        temp.next = this.tail; 
        temp.prev = prev; 
        prev.next = temp; 
        }
    }
  
}

export class HashMapStorage implements MapStorage {
    map: Map<number, DoublyLinkedList>;

    constructor(map: Map<number, DoublyLinkedList>) {
        this.map = map;
    }

    get(key: number): DoublyLinkedList | null {
        return this.map.get(key) ?? null;
    }

    set(key: number, value: DoublyLinkedList): void {
        this.map.set(key, value);
    }

    delete(key: number): void {
        this.map.delete(key);
    }
}


export interface CacheManager {

    get(key: number): string; 
    put(key: number, value: string): void; 
}


export class LRUCacheManager implements CacheManager {

    mapStorage: MapStorage; 
    linkedListStorage: LinkedListStorage; 
    capacityManager: ICapacityManager; 

    constructor(mapStorage: MapStorage, linkedListStorage: LinkedListStorage, capacityManager: ICapacityManager)
    {
        this.mapStorage = mapStorage; 
        this.linkedListStorage = linkedListStorage; 
        this.capacityManager = capacityManager; 
    }

   
    get(key: number): string {
        let temp = this.mapStorage.get(key); 
        if(temp)
        {
        this.linkedListStorage.deleteNode(temp); 
        this.linkedListStorage.addNewNode(temp);   
        this.mapStorage.set(key, temp);    
        return temp.value; 
        }
        else 
        {
            return "Key is not present"; 
        }
    
    }
    put(key: number, value: string): void {
        let temp = this.mapStorage.get(key);
        if(!temp)
            {
                if(this.capacityManager.isFull())
                {
                    
                 let deletedNode = this.linkedListStorage.deleteFromHead(); 

                 if(deletedNode)
                 this.mapStorage.delete(deletedNode.key); 
                    
                }
                else 
                {
                   this.capacityManager.decreaseCapacity();
                }
                let newNode = DoublyLinkedListFactory.createNewNode(key, value)
               this.linkedListStorage.addNewNode(newNode); 
               this.mapStorage.set(key,newNode); 
          }
          else 
          {
            
             
                this.linkedListStorage.deleteNode(temp); 
                temp.value = value; 
                this.linkedListStorage.addNewNode(temp); 
                this.mapStorage.set(key,temp);
                
    
          }


}

    




}

export interface ICapacityManager {

    decreaseCapacity(): void ;
    isFull(): boolean; 
}

export class CapacityManager  implements ICapacityManager{

    private capacity: number; 
    constructor(capacity: number)
    {
        this.capacity = capacity; 
    }
    decreaseCapacity(): void {
       this.capacity -= 1; 
    }
    isFull(): boolean {
      return this.capacity == 0; 
    }
    
}


export class DoublyLinkedListFactory {

    static createNewNode(key? : number , value?: string) : DoublyLinkedList{

        return new DoublyLinkedList(key, value); 
    }
}

//main
let map : Map<CacheStrategy, CacheManager> = new Map<CacheStrategy, CacheManager>(); 
map.set(CacheStrategy.LRUStrat, new LRUCacheManager(new HashMapStorage(new Map<number, DoublyLinkedList>()), 
new DoublyLinkedListStorage(DoublyLinkedListFactory.createNewNode(), DoublyLinkedListFactory.createNewNode()), 
CapacityManagerFactory.getCapacityManager(3)) ); 
let lruCache = new LRUCache(map,CacheStrategy.LRUStrat);
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



