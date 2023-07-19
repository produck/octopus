import { T, U } from '@produck/mold';

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

	fetchValue(generator) {
		const index = this.valueIndex++;
		const { values } = this.data;

		if (index < values.length) {
			return values[index];
		} else {
			if (!T.Native.Function(generator)) {
				U.throwError('value', 'function');
			}

			return values[index] = generator();
		}
	}
}
