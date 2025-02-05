class Node {
	constructor(data) {
		this.data = data;
		this.next = null;
	}
}

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

	dequeue() {
		if (this.length === 0) {
			return null;
		}

		const data = this.head.data;
		this.head = this.head.next;
		this.length--;

		if (!this.head) {
			this.tail = null;
		}

		return data;
	}
}