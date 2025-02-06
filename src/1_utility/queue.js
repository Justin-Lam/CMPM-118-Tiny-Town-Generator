/*
	Note on why queue is implemented via function instead of class:
	Queue via array (using shift), function, and class are all basically the same speed when length is less than 10,000
	However, queue via function seems to be ever so slightly faster than the others, hence we're going to use it
*/
const Node = function(data) {
	this.data = data;
	this.next = null;
};

const Queue = function() {
	this.head = null;
	this.tail = null;
	this.length = 0;
};

Queue.prototype.enqueue = function(data) {
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
};

Queue.prototype.dequeue = function() {
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
};