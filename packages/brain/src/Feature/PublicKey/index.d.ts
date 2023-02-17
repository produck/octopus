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

export module Filter {
	interface Abstract {
		name: 'All' | 'OfOwner';
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

		export interface OfOwner {
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
		All: (filter: Filter.Preset.All) => Promise<Data.Value[]>;
		OfOwner: (filter: Filter.Preset.OfOwner) => Promise<Data.Value[]>;
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
}

export function definePublicKey(options: Options.Value): PublicKeyConstructor;
export { definePublicKey as define };
