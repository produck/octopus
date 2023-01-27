import { Definer, _, Model } from '@produck/shop';

import * as Data from './Data.mjs';

export const BaseApplication = Model.define({
	name: 'Application',
	data: Data.normalize,
	creatable: true,
	deletable: true,
	base: Definer.Base(({ Declare }) => {
		Declare.Prototype.notDestroyedRequired()
			.Accessor('id', function () {
				return _(this).id;
			})
			.Accessor('createdAt', function () {
				return new Date(_(this).createdAt);
			});
	}),
	toJSON() {
		return {
			id: this.id,
			createdAt: this.createdAt,
		};
	},
});
