import { createVerify } from 'node:crypto';
import { T, U } from '@produck/mold';
import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';

const SIGNATURE_REG = /^[0-9a-f]+$/i;

export const BasePublicKey = Model.define({
	name: 'PublicKey',
	creatable: true,
	deletable: true,
	data: Data.normalize,
	base: Definer.Base(({ Declare }) => {
		Declare.Prototype.notDestroyedRequired()
			.Accessor('id', function () {
				return _(this).id;
			})
			.Accessor('owner', function () {
				return _(this).owner;
			})
			.Accessor('createdAt', function () {
				return new Date(_(this).createdAt);
			})
			.Method('verify', function (plain, signature) {
				if (!T.Native.String(plain)) {
					U.throwError('plain', 'string');
				}

				if (!T.Native.String(signature) || !SIGNATURE_REG.test(signature)) {
					U.throwError('signature', 'hex string');
				}

				const validator = createVerify('SHA256');

				validator.update(plain);

				try {
					return validator.verify(_(this).pem, signature, 'hex');
				} catch {
					return false;
				}
			});
	}),
	toJSON() {
		const { id, owner, createdAt } = _(this);

		return {
			id,
			owner,
			createdAt: new Date(createdAt),
		};
	},
});
