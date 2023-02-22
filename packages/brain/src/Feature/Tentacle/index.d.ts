import { Entity } from '@produck/shop';
import { Schema } from '@produck/mold';

export module Data {
	interface Value {
		id: string;
		craft: string;
		version: string;
		ready: boolean;
		job: string | null;
		createdAt: number;
		visitedAt: number;
	}

	export const Schema: Schema<Value>
	export function normalize(options: Value): Value;
}

export module Filter {
	interface Abstract {
		name: 'All' | 'IsCraft';
		[key: string]: any;
	}

	export const FilterSchema: Schema<Abstract>
	export function normalize(filter: Abstract): Abstract;

	export namespace Preset {
		interface RangeFilter {
			busy: boolean | null;
			ready: boolean | null;
			visitedIn: number | null;
			createdIn: number | null;
		}


		export interface All extends RangeFilter {
			name: 'All';
		}

		export const All: {
			Schema: Schema<All>;
			normalize: (filter: All) => All;
		}

		export interface IsCraft extends RangeFilter {
			name: 'IsCraft';
			product: string;
		}

		export const IsCraft: {
			Schema: Schema<IsCraft>;
			normalzie: (filter: IsCraft) => IsCraft;
		}
	}
}

export module Options {
	interface Query {
		All: (filter: Filter.Preset.All) => Promise<Array<Data.Value>>;
		IsCraft: (filter: Filter.Preset.IsCraft) => Promise<Array<Data.Value>>;
	}

	interface Value {
		name?: string;
		has?: (id: string) => Promise<boolean>;
		get?: (id: string) => Promise<Data.Value | null>;
		query?: Query;
		create?: (data: Data.Value) => Promise<Data.Value>;
		save?: (data: Data.Value) => Promise<Data.Value>;
		destroy?: (data: Data.Value) => Promise<void>;
	}

	export const Schema: Schema<Value>;
	export function normalize(options: Value): Value;
}

export interface Tentacle extends Entity.Proxy.Model {
	id: string;
	craft: string;
	version: string;
	job: string | null;
	ready: boolean;
	createdAt: Date;
	visitedAt: Date;
	visit(): this;
	pick(jobId: string): this;
	free(): this;
	toValue(): { id: string };
}

export interface TentacleConstructor extends Entity.Proxy.ModelConstructor {
	new(data: Data.Value): Tentacle;
	query(filter: Filter.Abstract): Promise<Array<Tentacle>>;
	fetch(data: Data.Value): Promise<Tentacle>;
}

export function defineTentacle(options: Options.Value): TentacleConstructor;
export { defineTentacle as define };
