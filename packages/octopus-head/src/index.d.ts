import * as Duck from '@produck/duck';

import * as Feature from './Feature';

type ServerMode = 'HTTP' | 'HTTPS' | 'REDIRECT' | 'BOTH';

interface Settings {
	application: {
		mode: ServerMode,
		http: {
			host: string;
			port: number;
		},
		https: {
			host: string;
			port: number;
			key: string;
			cert: string;
		}
	},
	agent: {
		local: {
			host: string;
			port: number;
		},
		remote: {
			host: string;
			port: number;
		}
	}
}

declare module '@produck/duck' {
	interface ProductKit {
		Application: Feature.Application.Registry;
		Environment: Feature.Environment;
		Workshop: Feature.Workshop.Manager;
		Agent: Feature.Agent.Manager;
		Scheduler: Feature.Scheduler;
		Group: Feature.Group;
		Settings: Settings;
	}
}
