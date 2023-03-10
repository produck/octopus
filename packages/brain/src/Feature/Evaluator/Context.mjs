import { Circ, Normalizer, P, PROPERTY, S } from '@produck/mold';

export const DumpSchema = Circ(SelfSchema => S.Object({
	values: S.Array(),
	children: S.Array({ items: SelfSchema }),
}));

const DataSchema = S.Object({
	dump: DumpSchema,
	finished: S.Object({
		[PROPERTY]: S.Object({
			id: P.String(),
			ok: P.Boolean(),
			error: P.OrNull(P.String()),
			target: P.Any(),
		}),
	}),
	crafts: S.Object({
		[PROPERTY]: P.Function(),
	}),
});

const normalizeData = Normalizer(DataSchema);

export class Context {
	dump = null;
	finished = {};
	creating = [];
	crafts = {};
	done = false;

	constructor(_data) {
		const data = normalizeData(_data);

		this.dump = data.dump;
		this.finished = data.finished;
		this.crafts = data.crafts;
	}

	hasJob(jobId) {
		return Object.hasOwn(this.finished, jobId);
	}

	fetchJob(id) {
		return this.finished[id];
	}

	assertCraftAndSource(name, source) {
		if (!this.crafts[name]) {
			throw new Error(`Invalid craft(${name})`);
		}

		if (!this.crafts[name](source)) {
			throw new Error(`Bad craft(${name}) source.`);
		}
	}

	planJob(id, craft, source) {
		this.assertCraftAndSource(craft, source);
		this.creating.push({ id, craft, source });
	}
}
