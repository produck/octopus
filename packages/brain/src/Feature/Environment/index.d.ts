import { EventEmitter } from 'node:events';
import { Schema } from '@produck/mold';

export module Property {
	interface Map {
		'ENVIRONMENT.REFRESH.INTERVAL': number;
		'ENVIRONMENT.AGE': number;

		'GROUP.ACTIVITY.TIMEOUT': number;
		'GROUP.WATCHING.INTERVAL': number;
		'GROUP.KICKOUT.TIMEOUT': number;

		'SCHEDULER.EVALUATING.INTERVAL': number;

		'APPLICATION.REQUEST.TIMEOUT': number;

		'PRODUCT.QUEUE.MAX': number;
		'PRODUCT.ORDER.CREATION.TIMEOUT': number;

		'AGENT.SYNC.INTERVAL': number;
		'AGENT.SYNC.TIMEOUT': number;
		'AGENT.SYNC.RETRY.INTERVAL': number;

		'RJSP.SERVER.HOST': string;
		'RJSP.SERVER.PORT': number;
		'RJSP.REDIRECT.ENABLED': boolean;
	}

	export type Key = keyof Property.Map;
	export type Value = Map[keyof Property.Map];
}

type EventListenerMap = {
	'fetch': () => void;
	'fetch-error': (error: Error) => void;
	'set': <T extends Property.Key>(name: T, value: Property.Map[T]) => void;
	'set-error': (error: Error) => void;
	'data-error': (error: Error) => void;
}

export type EventName = keyof EventListenerMap;

export class BaseEnvironment extends EventEmitter {
	on<T extends EventName>(eventName: T, listener: EventListenerMap[T]): this;
	off<T extends EventName>(eventName: T, listener: EventListenerMap[T]): this;
	once<T extends EventName>(eventName: T, listener: EventListenerMap[T]): this;

	_fetch(): Promise<void>;

	_set<T extends Property.Key>(name: T, value: Property.Map[T]): Promise<void>;

	get<T extends Property.Key>(name: T): Property.Map[T];

	set<T extends Property.Key>(name: T, value: Property.Map[T]): Promise<void>;

	fetch(): Promise<Property.Map>;

	start(): void;

	stop(): void;

	install(map: Property.Map): Promise<void>;
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

declare class CustomEnvironment extends BaseEnvironment {}

export function defineEnvironment(
	_options: Options.Object
): typeof CustomEnvironment;

export { defineEnvironment as define };