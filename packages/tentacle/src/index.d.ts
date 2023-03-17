import '@produck/duck';
import '@produck/duck-runner';
import * as DuckCLI from '@produck/duck-cli';

import * as Broker from './Feature/Broker';
import * as RJSP from './Feature/RJSP';
import * as Identifier from './Feature/Identifier';

export interface CommandStartOpts {
	mode: 'solo' | 'processes';
	host: string;
	port: string;
	renew: boolean;
}

export interface CommandCleanOpts {
	includeId: boolean;
}

interface Options<T = any> extends Broker.Options.Member<T> {
	craft?: string;
	version?: string;

	id?: Identifier.Options.Object<{
		readonly workspace: string;
	}>;

	command?: {
		options: {
			start?: DuckCLI.Bridge.Feature.Options;
			clean?: DuckCLI.Bridge.Feature.Options;
		},
		start?: (
			opts: CommandStartOpts,
			environment: Environment,
			next: () => any
		) => Promise<void> | void;
		clean?: (opts: CommandCleanOpts) => Promise<void> | void;
	};
}

interface ServerAddress {
	host: string;
	port: number;
}

interface Environment {
	id: string;
	ready: boolean;
	active: boolean;
	job: string | null;
	config: RJSP.Data.Config;
	server: ServerAddress;
}

type EventListenerMap = {
	'boot': [];
	'halt': [];

	'sync': [];
	'redirect': [];
	'pick': [job: string];
	'free': [job: string];

	'request-retry': [role: string, code: number];
	'request-fail': [role: string, code: number];
}

declare module '@produck/duck' {
	interface ProductKit {
		Options: Options;
		Environment: Environment;
		Broker: Broker.Broker;
		Client: RJSP.RJSPClient;
		Id: Identifier.IdentifierAccessor;
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
