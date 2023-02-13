import { Normalizer, P, PROPERTY, S } from '@produck/mold';

const DataSchema = S.Object({
	history: S.Array({ items: P.Any() }),
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
	history = [];
	index = 0;
	finished = {};
	creating = [];
	crafts = {};

	constructor(_data) {
		const data = normalizeData(_data);

		this.history = data.history;
		this.finished = data.finished;
		this.crafts = data.crafts;
	}

	fetchValue(value) {
		const { history, index } = this;

		this.index++;

		if (index < history.length) {
			return history[index];
		}

		return history[index] = value;
	}

	fetchJob(id) {
		return this.finished[id];
	}

	hasJob(jobId) {
		return Object.hasOwn(this.finished, jobId);
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
		this.creating.push({ id, craft, source });
	}
}
