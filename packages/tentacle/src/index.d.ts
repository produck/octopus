import '@produck/duck';
import '@produck/duck-runner';

import * as Broker from './Feature/Broker';
import * as RJSP from './Feature/RJSP';

interface Options extends Broker.Options.Member {
	craft: string;
	version: string;
}

interface ServerAddress {
	host: string;
	port: number;
}

interface Environment {
	id: string;
	ready: boolean;
	config: RJSP.Data.Config;
	server: ServerAddress;
}

type EventListenerMap = {
	'request-halt': [];
	'sync': [];
	'sync-error': [code: number];
	'work-error': [message: string];
	'redirect': [];
	'pick': [job: string];
	'free': [job: string];
}

declare module '@produck/duck' {
	interface ProductKit {
		Options: Options;
		Environment: Environment;
	}
}

declare module '@produck/duck-runner' {
	interface EventBus {
		on<T extends keyof EventListenerMap>(
			eventName: T,
			listener: (...args: EventListenerMap[T]) => void
		): this;
	}
}
