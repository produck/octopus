import { T, U } from '@produck/mold';
import { Definer, Model, _ } from '@produck/shop';

import * as Evaluator from '../Evaluator/index.mjs';
import * as Data from './Data.mjs';
import * as Private from './private.mjs';

const vm = new Evaluator.Engine();

function isOrder(any) {
	const _flag = _(this).order(any);

	if (!T.Native.Boolean(_flag)) {
		U.throwError('flag <= data.order()', 'boolean');
	}

	return _flag;
}

function isArtifact(any) {
	const _flag = _(this).artifact(any);

	if (!T.Native.Boolean(_flag)) {
		U.throwError('flag <= data.artifact()', 'boolean');
	}

	return _flag;
}

export function assertProcedureName(any) {
	if (!T.Native.String(any)) {
		U.throwError('name', 'string');
	}
}

function compileSelfScript() {
	return new Evaluator.Program(_(this).script);
}

const defineBase = Definer.Base(({ Declare }) => {
	function evaluate(order, contextData = {}) {
		const context = new Evaluator.Context(contextData);

		try {
			const artifact = vm.execute(this.program, context, order);
			const { done } = context;

			if (!done) {
				return {
					done, ok: true,
					creating: context.creating,
					dump: context.dump,
				};
			}

			if (!this.isArtifact(artifact)) {
				U.throwError('artifact <= vm.execute()', 'valid artifact');
			}

			return { done, ok: true, artifact };
		} catch (error) {
			return { done: true, ok: false, error: error.message };
		}
	}

	Declare.Prototype
		.Accessor('name', function () {
			return _(this).name;
		})
		.Accessor('program', compileSelfScript)
		.Method('isOrder', isOrder)
		.Method('isArtifact', isArtifact)
		.Method('evaluate', evaluate);

	Declare.Constructor
		.Method('register', async function register(...args) {
			const procedure = await this.create(...args);

			Private._(this).registry[procedure.name] = procedure;

			return procedure;
		})
		.Method('isValid', function (name) {
			assertProcedureName(name);

			return Object.hasOwn(Private._(this).registry, name);
		})
		.Method('use', function use(name) {
			if (!this.isValid(name)) {
				throw new Error(`There is no procedure(${name}).`);
			}

			return Private._(this).registry[name];
		});
});

export const BaseProcedure = Model.define({
	name: 'Procedure',
	creatable: true,
	data: Data.normalize,
	base: defineBase,
});
