import * as Crank from '@produck/crank';
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

class ExternData {
	dump = null;
	creating = [];
	finished = {};
	crafts = {};
	dataStore = new Map();

	constructor(_data) {
		const data = normalizeData(_data);

		this.dump = data.dump;
		this.finished = data.finished;
		this.crafts = data.crafts;
	}
}

export class OctopusExtern extends Crank.Extern {
	#data;
	done = true;

	get dump() {
		return this.#data.dump;
	}

	get creating() {
		return this.#data.creating;
	}

	constructor(_data) {
		super();

		this.#data = new ExternData(_data);
	}

	hasJob(jobId) {
		return Object.hasOwn(this.#data.finished, jobId);
	}

	fetchJob(id) {
		return this.#data.finished[id];
	}

	assertCraftAndSource(name, source) {
		if (!this.#data.crafts[name]) {
			throw new Error(`Invalid craft(${name})`);
		}

		if (!this.#data.crafts[name](source)) {
			throw new Error(`Bad craft(${name}) source.`);
		}
	}

	planJob(id, craft, source) {
		this.assertCraftAndSource(craft, source);
		this.#data.creating.push({ id, craft, source });
	}

	saveData(key, value) {
		this.#data.dataStore.set(key, value);
	}

	fetchData(key) {
		return this.#data.dataStore.get(key);
	}

	hasData(key) {
		return this.#data.dataStore.has(key);
	}
}

export { OctopusExtern as Extern };
