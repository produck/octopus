export class Dump {
	constructor(data) {
		this.data = data;
		this.valueIndex = 0;
		this.childIndex = 0;
	}

	fetchChild() {
		const index = this.childIndex++;
		const { children } = this.data;

		const childData = index < children.length
			? children[index]
			: children[index] = { values: [], children: [] };

		return new Dump(childData);
	}

	fetchValue(value) {
		const index = this.valueIndex++;
		const { values } = this.data;

		return index < values.length ? values[index] : values[index] = value;
	}
}
