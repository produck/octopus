import { Definer, Model, _ } from '@produck/shop';

const defineBase = Definer.Base(({ Declare }) => {
	Declare.Prototype.Method('evaluate', function evaluate() {
		const { workflow } = _(this);
		const jobs = {};

		const mutations = [];

		let evaluated = false;

		for (const step of workflow()) {

		}

		evaluated = true;
	});
});

export const BaseProcedure = Model.define({
	name: 'Procedure',
	creatable: true,
	base: defineBase,
});
