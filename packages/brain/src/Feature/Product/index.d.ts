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
		dump: Procedure.ContextDump;
		createdAt: number;
		orderedAt: number | null;
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

declare namespace Filter {
	interface State {
		ordered?: boolean | null;
		finished?: boolean | null;
	}

	interface OfOwner extends State {
		name: 'OfProduct';
		owner: string;
	}

	interface All extends State {
		name: 'All';
	}

	type Descriptor = All | OfOwner;
}

export module Options {
	interface Query {
		All: (filter: Filter.All) => Promise<Array<Data.Value>>;
		OfOwner: (filter: Filter.OfOwner) => Promise<Array<Data.Value>>;
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
	query(filter: Filter.Descriptor): Promise<Array<Product>>;
	get(id: string): Promise<Product | null>;
}

export function defineProduct(options: Options.Value): Options.Value;
export { defineProduct as define };
