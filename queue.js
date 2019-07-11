module.exports = class Queue {
    constructor() {
        this.queue = [];
        this.size = 0;
    }
    enqueue(el) {
        this.queue.push(el);
        this.size++;
    }
    dequeue() {
        this.size--;
        return this.queue.splice(0, 1)[0];
    }
    enqueueChunk(arr) {
        this.queue = this.queue.concat(arr);
        this.size += arr.length;
    }
}