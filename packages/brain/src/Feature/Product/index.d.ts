import { Entity } from '@produck/shop';
import { Schema } from '@produck/mold';

import * as Procedure from '../Procedure';

interface StatusMap {
	NEW: 0;
	OK: 100;
	ERROR: 200;
	TIMEOUT: 201;
	ABORTED: 202;
}

type Status = StatusMap[keyof StatusMap];

export module Data {
	type Message = string | null;

	interface Value {
		id: string;
		owner: string;
		model: string;
		createdAt: number;
		orderedAt: number | null;
		startedAt: number | null;
		finishedAt: number | null;
		status: Status;
		message: string | null;
		order: any;
		artifact: any;
	}

	export const Schema: Schema<Value>;
	export const StatusSchema: Schema<Status>;
	export const MessageSchema: Schema<Message>;

	export function normalize(data: Value): Value;
	export function normalizeStatus(status: Status): Status;
	export function normalizeMessage(message: Message): Message;
}

export module Filter {
	interface Abstract {
		name: 'All' | 'OfOwner';
		[key: string]: any;
	}

	export const FilterSchema: Schema<Abstract>
	export function normalize(filter: Abstract): Abstract;

	export namespace Preset {
		interface StateFilter {
			ordered?: boolean | null;
			started?: boolean | null;
			finished?: boolean | null;
		}

		export interface All extends StateFilter {
			name: 'All';
		}

		export const All: {
			Schema: Schema<All>;
			normalize: (filter: All) => All;
		}

		export interface OfOwner extends StateFilter {
			name: 'OfOwner';
			owner: string;
		}

		export const OfOwner: {
			Schema: Schema<OfOwner>;
			normalzie: (filter: OfOwner) => OfOwner;
		}
	}
}

export module Options {
	interface Query {
		All: (filter: Filter.Preset.All) => Promise<Array<Data.Value>>;
		OfOwner: (filter: Filter.Preset.OfOwner) => Promise<Array<Data.Value>>;
	}

	interface Value {
		name: string;
		has: (id: string) => Promise<boolean>;
		get: (id: string) => Promise<Data.Value | null>;
		query: Query;
		create: (data: Data.Value) => Promise<Data.Value>;
		save: (data: Data.Value) => Promise<Data.Value>;
		destroy?: (data: Data.Value) => Promise<void>;
		Procedure: Procedure.ProcedureConstructor;
	}

	export const Schema: Schema<Value>;
	export function normalize(options: Value): Value;
}

export interface Product extends Entity.Proxy.Model {
	id: string;
	owner: string;
	model: string;
	status: Status;
	message: Data.Message;
	dump: Procedure.ContextDump;
	readonly createdAt: Date;
	readonly orderedAt: Date | null;
	readonly startedAt: Date | null;
	readonly finishedAt: Date | null;
	order: any;
	artifact: any;
	setOrder(): this;
	start(): this;
	finish(status: Status, message: Data.Message): this;
	complete(artifact: any): this;
}

export interface ProductConstructor extends Entity.Proxy.ModelConstructor {
	new(data: Data.Value): Product;
	query(filter: Filter.Abstract): Promise<Array<Product>>;
	get(id: string): Promise<Product>;
}

export function defineProduct(options: Options.Value): Options.Value;
export { defineProduct as define };
