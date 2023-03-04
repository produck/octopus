import { Entity } from '@produck/shop';
import { Schema } from '@produck/mold';

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

declare namespace Filter {
	interface State {
		ordered?: boolean | null;
		finished?: boolean | null;
	}

	interface OfOwner extends State{
		name: 'OfProduct';
		product: string;
	}

	interface All extends State{
		name: 'All';
	}

	type Descriptor = All | OfOwner;
}

export module Options {
	interface Query {
		All: (filter: Filter.All) => Promise<Data.Value[]>;
		OfOwner: (filter: Filter.OfOwner) => Promise<Data.Value[]>;
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

export interface PublicKey extends Entity.Proxy.Model {
	readonly id: string;
	readonly owner: string;
	readonly createdAt: Date;
	verify(plain: string, signature: string): boolean;
}

export interface PublicKeyConstructor extends Entity.Proxy.ModelConstructor {
	new(): PublicKey;
	query(filter: Filter.Descriptor): Promise<Array<PublicKey>>;
}

export function definePublicKey(options: Options.Value): PublicKeyConstructor;
export { definePublicKey as define };
