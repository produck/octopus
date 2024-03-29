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

declare namespace Filter {
	interface State {
		busy?: boolean | null;
		ready?: boolean | null;
	}

	interface All extends State {
		name: 'All';
	}

	type Descriptor = All;
}

export module Options {
	interface Query {
		All: (filter: Filter.All) => Promise<Array<Data.Value>>;
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
	readonly id: string;
	readonly craft: string;
	readonly version: string;
	readonly job: string | null;
	readonly ready: boolean;
	readonly createdAt: Date;
	readonly visitedAt: Date;
	pick(jobId: string): this;
	free(): this;
	setReady(flag?: boolean): this;
	toValue(): { id: string };
}

export interface TentacleConstructor extends Entity.Proxy.ModelConstructor {
	new(data: Data.Value): Tentacle;
	query(filter: Filter.Descriptor): Promise<Array<Tentacle>>;
	fetch(data: Data.Value): Promise<Tentacle>;
}

export function defineTentacle(options: Options.Value): TentacleConstructor;
export { defineTentacle as define };
