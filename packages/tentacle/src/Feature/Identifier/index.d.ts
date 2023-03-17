import { Schema } from '@produck/mold'

type OrPromise<T> = Promise<T> | T;

export module Options {
	interface Object<V = any> {
		has: (variables: V) => OrPromise<boolean>;
		get: (variables: V) => OrPromise<string>;
		create: (variables: V) => OrPromise<string>;
		clean: (variables: V) => OrPromise<void>;
	}

	export const Schema: Schema<Object>;
	export function normalize(options: Object): Object;
}

export interface IdentifierAccessor {
	readonly value: string;
	has(): Promise<boolean>;
	read(): Promise<void>;
	write(): Promise<void>;
	clean(): Promise<void>;
}

export interface IdentifierAccessorConstructor<V> {
	new(options: Options.Object<V>, variables: V): IdentifierAccessor;
}

export const IdentifierAccessor: IdentifierAccessorConstructor<any>;
