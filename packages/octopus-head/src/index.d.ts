import * as Duck from '@produck/duck';

import { Workshop, Environment, Application, Agent } from './Feature';

declare module '@produck/duck' {
	interface ProductKit {
		Application: Application.Registry;
		Environment: Environment.Registry;
		Workshop: Workshop.Manager;
		Agent: Agent.Manager;
	}
}
