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

interface Options {
	Application: Feature.Application.Options.Value;
	Brain: Feature.Brain.Options.Value;
	Craft: Feature.Craft.Options.Value;
	Environment: Feature.Environment.Options.Object;
	Job: Feature.Job.Options.Value;
	Procedure: Feature.Procedure.Options.Value;
	Product: Feature.Product.Options.Value;
	PublicKey: Feature.PublicKey.Options.Value;
	Tentacle: Feature.Tentacle.Options.Value;

	isEvaluatable: () => Promise<void>;
}

declare module '@produck/duck' {
	interface ProductKit {
		Options: Options;
		Settings: Settings;

		Application: Feature.Application.Constructor;
		Brain: Feature.Brain.BrainConstructor;
		Craft: Feature.Craft.CraftConstructor;
		Environment: Feature.Environment.CustomEnvironment;
		Job: Feature.Job.JobConstructor;
		Procedure: Feature.Procedure.ProcedureConstructor;
		Product: Feature.Product.ProductConstructor;
		PublikKey: Feature.PublicKey.PublicKeyConstructor;
		Tentacle: Feature.Tentacle.TentacleConstructor;
	}
}
