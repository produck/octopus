import * as Shop from '@produck/shop';
import { Schema } from '@produck/mold';

export module Data {
	interface Value {
		id: string;
		createdAt: number;
	}

	export const Schema: Schema<Value>;
	export function normalize(data: Value): Value;
}

export module Options {
	interface Value {
		name?: string;
		has?: (id: string) => Promise<boolean>;
		get?: (id: string) => Promise<Data.Value | null>;
		query?: () => Promise<Data.Value[]>;
		create?: (data: Data.Value) => Promise<Data.Value>;
		destroy?: (data: Data.Value) => Promise<void>;
	}

	export const Schema: Schema<Value>;
	export function normalize(options: Value): Value;
}

export interface Application extends Shop.Entity.Proxy.Model {
	readonly id: string;
	readonly createdAt: Date;
}

export interface ApplicationConstructor extends Shop.Entity.Proxy.ModelConstructor {
	new(data: Data.Value): Application;

	get(data: Data.Value): Promise<Application | null>;
}

export function define(
	options: Options.Value
): ApplicationConstructor;

export { ApplicationConstructor as Constructor };
