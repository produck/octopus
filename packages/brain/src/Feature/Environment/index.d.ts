import { EventEmitter } from 'node:events';
import { Schema } from '@produck/mold';

export module Property {
	interface Map {
		'ENVIRONMENT.REFRESH.INTERVAL': number;
		'ENVIRONMENT.AT': number;

		'BRAIN.ALIVE.TIMEOUT': number;
		'BRAIN.WATCH.INTERVAL': number;

		'APPLICATION.REQUEST.TIMEOUT': number;

		'PRODUCT.QUEUE.MAX': number;
		'PRODUCT.ORDER.TIMEOUT': number;

		'AGENT.INTERVAL': number;
		'AGENT.TIMEOUT': number;
		'AGENT.RETRY': number;

		'TENTACLE.ALIVE.TIMEOUT': number;

		'RJSP.SERVER.HOST': string;
		'RJSP.SERVER.PORT': number;
		'RJSP.REDIRECT.ENABLED': boolean;
	}

	export type Key = keyof Property.Map;
	export type Value = Map[keyof Property.Map];

	export const Schema: Schema<Map>;
	export function normalize(data: Map): Map;
}

export module Options {
	interface Object {
		name?: string;
		fetch?: () => Promise<Property.Map>;
		set?: (name: Property.Key, value: Property.Value) => Promise<void>;
	}

	export function normalize(_options: Object): Object;
	export const Schema: Schema<Object>;
}

type EventMap = {
	'fetch': () => void;
	'update': () => void;
	'fetch-error': (error: Error) => void;
	'set': <T extends Property.Key>(name: T, value: Property.Map[T]) => void;
	'set-error': (error: Error) => void;
	'data-error': (error: Error) => void;
}

export type EventName = keyof EventMap;

declare class BaseEnvironment extends EventEmitter {
	on<T extends EventName>(eventName: T, listener: EventMap[T]): this;
	off<T extends EventName>(eventName: T, listener: EventMap[T]): this;
	once<T extends EventName>(eventName: T, listener: EventMap[T]): this;

	_fetch(): Promise<void>;

	_set<T extends Property.Key>(name: T, value: Property.Map[T]): Promise<void>;

	get<T extends Property.Key>(name: T): Property.Map[T];

	set<T extends Property.Key>(name: T, value: Property.Map[T]): Promise<void>;

	fetch(): Promise<Property.Map>;

	start(): void;

	stop(): void;

	install(map: Property.Map): Promise<void>;
}

export class CustomEnvironment extends BaseEnvironment {}

export function defineEnvironment(
	options: Options.Object
): typeof CustomEnvironment;

export { defineEnvironment as define };
