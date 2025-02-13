/** A node of a linked list. */
class Node {
	constructor(data) {
		this.data = data;
		this.next = null;
	}
}

/** Utilizes a linked list for O(1) enqueueing/dequeueing. */
class Queue {
	front = null;
	back = null;
	length = 0;

	enqueue(data) {
		const node = new Node(data);

		if (this.length === 0) {
			this.front = node;
			this.back = node;
		}
		else {
			this.back.next = node;
			this.back = node;
		}
		
		this.length++;
	}

	/** @returns {any | null} the element at the front of the queue or null if it's is empty */
	dequeue() {
		if (this.length === 0) return null;

		const data = this.front.data;
		this.front = this.front.next;
		this.length--;

		if (!this.front) this.back = null;	// update back to match front

		return data;
	}
}