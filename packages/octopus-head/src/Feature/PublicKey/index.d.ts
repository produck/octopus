import * as Shop from '@produck/shop';
import { Schema } from '@produck/mold';
import exp = require('constants');

export module Data {
	interface Value {
		id: string;
		owner: string;
		pem: string;
		createdAt: number;
	}

	export const Schema: Schema<Value>;
	export function normalize(data: Value): Value;
}

export module Filter {

}

export module Options {
	interface Query {
		All: () => Promise<Data.Value[]>;
		OfOwner: () => Promise<Data.Value[]>;
	}

	interface Value {
		name?: string;
		has?: (id: string) => Promise<boolean>;
		get?: (id: string) => Promise<Data.Value | null>;
		save: (data: Data.Value) => Promise<Data.Value>;
		query?: Query;
		create?: (data: Data.Value) => Promise<Data.Value>;
		destroy?: (data: Data.Value) => Promise<void>;
	}
}

export interface PublicKey extends Shop.Entity.Proxy.Model {
	readonly id: string;
	readonly owner: string;
	readonly createdAt: Date;
	verify(plain: string, signature: string): boolean;
}

export interface PublicKeyConstructor extends Shop.Entity.Proxy.ModelConstructor {
	new(): PublicKey;
	get(data: Data.Value): Promise<PublicKey>;
}
