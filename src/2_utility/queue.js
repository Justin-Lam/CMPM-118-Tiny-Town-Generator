class Node {
	constructor(data) {
		this.data = data;
		this.next = null;
	}
}

/** Utilizes a linked list for O(1) enqueueing/dequeueing. */
class Queue {
	head = null;
	tail = null;
	length = 0;

	enqueue(data) {
		const node = new Node(data);

		if (this.length === 0) {
			this.head = node;
			this.tail = node;
		}
		else {
			this.tail.next = node;
			this.tail = node;
		}
		
		this.length++;
	}

	/** @returns {any | null} the element at the head of the queue or null if the queue is empty */
	dequeue() {
		if (this.length === 0) return null;

		const data = this.head.data;
		this.head = this.head.next;
		this.length--;

		if (!this.head) this.tail = null;	// make tail match head

		return data;
	}
}