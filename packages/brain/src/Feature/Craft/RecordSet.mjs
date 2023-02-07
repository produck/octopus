export class RecordSet {
	#list = [];

	constructor(list = []) {
		Object.assign(this.#list, list);
	}

	has(id) {
		for (const record of this.#list) {
			if (record.id === id) {
				return true;
			}
		}

		return false;
	}

	get list() {
		return [...this.#list];
	}
}
