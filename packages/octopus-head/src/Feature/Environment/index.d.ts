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

		'APPLICATION.TIMEOUT': number;

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
	'put': <T extends Property.Key>(name: T, value: Property.Map[T]) => void;
	'put-error': (error: Error) => void;
	'data-error': (error: Error) => void;
}

export type EventName = keyof EventListenerMap;

export class BaseOctopusEnvironment extends EventEmitter {
	on<T extends EventName>(eventName: T, listener: EventListenerMap[T]): this;
	off<T extends EventName>(eventName: T, listener: EventListenerMap[T]): this;
	once<T extends EventName>(eventName: T, listener: EventListenerMap[T]): this;

	_fetch(): Promise<void>;

	_put<T extends Property.Key>(name: T, value: Property.Map[T]): Promise<void>;

	get<T extends Property.Key>(name: T): Property.Map[T];

	put<T extends Property.Key>(name: T, value: Property.Map[T]): Promise<void>;

	fetch(): Promise<Property.Map>;

	start(): void;

	stop(): void;

	install(map: Property.Map): Promise<void>;
}

export module Options {
	interface Object {
		name?: string;
		fetch?: () => Promise<Property.Map>;
		put?: (name: Property.Key, value: Property.Value) => Promise<void>;
	}

	export function normalize(_options: Object): Object;
	export const Schema: Schema<Object>;
}

declare class CustomOctopusEvnironment extends BaseOctopusEnvironment {}

export function defineEnvironment(
	_options: Options.Object
): typeof CustomOctopusEvnironment;

export { defineEnvironment as define };
