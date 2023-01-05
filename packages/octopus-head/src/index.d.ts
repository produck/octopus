import * as Duck from '@produck/duck';

import * as Feature from './Feature';

declare module '@produck/duck' {
	interface ProductKit {
		Application: Feature.Application.Registry;
		Environment: Feature.Environment.Registry;
		Workshop: Feature.Workshop.Manager;
		Agent: Feature.Agent.Manager;
		Scheduler: Feature.Scheduler;
		Group: Feature.Group;
	}
}
