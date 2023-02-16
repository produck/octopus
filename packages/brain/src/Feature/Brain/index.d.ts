import { Entity } from '@produck/shop';
import { Schema } from '@produck/mold';

export module Data {
	interface Value {
		id: string;
		name: string;
		version: string;
		createdAt: number;
		visitedAt: number;
	}

	export const Schema: Schema<Value>;
	export function normalize(data: Value): Value;
}

type ExternalNameMap = {
	NOW: number;
	MAX_ALIVE_GAP: number;
	WATCHING_INTERVAL: number;
}

type ExternalKey = keyof ExternalNameMap;

export module Options {
	interface Value {
		name?: string;
		external?: <T extends ExternalKey>(key: T) => ExternalNameMap[T];
		get?: (data: Data.Value) => Promise<Data.Value>;
		has?: (id: string) => Promise<boolean>;
		query?: () => Promise<Array<Data.Value>>;
	}

	export const Schema: Schema<Value>;
	export function normalize(options?: Value): Value;
}

export interface Brain extends Entity.Proxy.Model {
	readonly id: string;
	readonly name: string;
	readonly version: string;
	readonly createdAt: Date;
	readonly visitedAt: Date;
}

type EventMap = {
	'grant': () => void;
	'watch-error': (error: Error) => void;
}

export type EventName = keyof EventMap;

export interface BrainConstructor extends Entity.Proxy.ModelConstructor, ExternalNameMap {
	new(data: Data.Value): Brain;

	on<T extends EventName>(eventName: T, listener: EventMap[T]): this;
	off<T extends EventName>(eventName: T, listener: EventMap[T]): this;
	once<T extends EventName>(eventName: T, listener: EventMap[T]): this;

	isActive(): boolean;
	current(): Brain | null;
	boot(selfData: Data.Value): Promise<this>;
	halt(): this;
}

export function defineBrain(options: Options.Value): BrainConstructor;
export { defineBrain as define };
