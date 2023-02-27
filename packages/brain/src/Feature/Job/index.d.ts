import { Entity } from '@produck/shop';
import { Schema } from '@produck/mold';

import * as Craft from '../Craft';

interface StatusMap {
	NEW: 0;
	OK: 100;
	ERROR: 200;
	TIMEOUT: 201;
	ABORTED: 202;
}

type Status = StatusMap[keyof StatusMap];

export const STATUS: StatusMap;

export module Data {
	type Message = string | null;

	interface Value {
		id: string;
		product: string;
		craft: string;
		createdAt?: number;
		visitedAt?: number;
		startedAt?: number | null;
		finishedAt?: number | null;
		status?: Status;
		message?: Message;
		source: any;
		target?: any;
	}

	export const StatusSchema: Schema<Status>;
	export const MessageSchema: Schema<Message>;
	export const Schema: Schema<Value>;

	export function normalize(data: Value): Value;
	export function normalizeStatus(status: Status): Status;
	export function normalizeMessage(message: Message): Message;
}

export module Filter {
	interface Abstract {
		name: 'All' | 'OfProduct';
		[key: string]: any;
	}

	export const FilterSchema: Schema<Abstract>
	export function normalize(filter: Abstract): Abstract;

	export namespace Preset {
		export interface All {
			name: 'All';
		}

		export const All: {
			Schema: Schema<All>;
			normalize: (filter: All) => All;
		}

		export interface OfProduct {
			name: 'OfProduct';
			product: string;
		}

		export const OfProduct: {
			Schema: Schema<OfProduct>;
			normalzie: (filter: OfProduct) => OfProduct;
		}
	}
}

export module Options {
	interface Query {
		All: (filter: Filter.Preset.All) => Promise<Array<Data.Value>>;
		OfProduct: (filter: Filter.Preset.OfProduct) => Promise<Array<Data.Value>>;
	}

	interface Value {
		name?: string;
		has?: (id: string) => Promise<boolean>;
		get?: (id: string) => Promise<Data.Value | null>;
		query?: Query;
		create?: (data: Data.Value) => Promise<Data.Value>;
		save?: (data: Data.Value) => Promise<Data.Value>;
		destroy?: (data: Data.Value) => Promise<void>;
		Craft: Craft.CraftConstructor;
	}

	export const Schema: Schema<Value>;
	export function normalize(options: Value): Value;
}

export interface Job extends Entity.Proxy.Model {
	readonly id: string;
	readonly product: string;
	readonly craft: string;
	readonly visitedAt: Date;
	readonly createdAt: Date;
	readonly startedAt: Date | null;
	readonly finishedAt: Date | null;
	readonly status: Status;
	readonly message: Data.Message;
	readonly source: any;
	readonly target: any;
	readonly isFinished: boolean;
	start(): this;
	finish(status: Status, message: Data.Message): this;
	complete(target: any): this;
	toValue(): { id: string; createdAt: number };
}

export interface JobConstructor extends Entity.Proxy.ModelConstructor {
	new(data: Data.Value): Job;
	query(filter: Filter.Abstract): Promise<Array<Job>>;
	create(data: Data.Value): Promise<Job>;
	get(id: string): Promise<Job | null>;
}

export function defineJob(options: Options.Value): Options.Value;
export { defineJob as define };
