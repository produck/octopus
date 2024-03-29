import * as DuckCLI from '@produck/duck-cli';
import { Middleware } from 'koa';
import * as Feature from './Feature';

type ServerMode = 'HTTP' | 'HTTPS' | 'REDIRECT' | 'BOTH';
type RuntimeMode = 'SOLO' | 'PROCESSES';

interface ConfigurationData {
	id: string;
	runtime: RuntimeMode;
	banner: Array<string>;
	application: {
		mode: ServerMode;
		http: {
			host: string;
			port: number;
		};
		https: {
			host: string;
			port: number;
			key: string;
			cert: string;
		};
	};
	agent: {
		host: string;
		port: number;
	};
}

interface Configuration extends ConfigurationData {
	update(value: Configuration): this;
}

interface CustomKit extends Omit<DuckCLI.CLIKit, 'setProgram' | 'Commander'> {
	setProgram: null;
	Commander: null;
}

interface CLIExtenderKit extends Omit<DuckCLI.CLIKit, 'setProgram'> {
	setProgram: null;
}

type CommandNext = () => Promise<void>;

interface Options {
	name?: string;
	version?: string;

	Application?: Feature.Application.Options.Value;
	Brain?: Feature.Brain.Options.Value;
	Craft?: Feature.Craft.Options.Value;
	Environment?: Feature.Environment.Options.Object;
	Job?: Feature.Job.Options.Value;
	Procedure?: Feature.Procedure.Options.Value;
	Product?: Feature.Product.Options.Value;
	PublicKey?: Feature.PublicKey.Options.Value;
	Tentacle?: Feature.Tentacle.Options.Value;

	observer: {
		lock: (id: string) => Promise<boolean>;
		unlock: (id: string) => Promise<void>;
	};

	cli?: {
		options: {
			global?: DuckCLI.Bridge.Feature.Options;
			start?: DuckCLI.Bridge.Feature.Options;
			install?: DuckCLI.Bridge.Feature.Options;
		};

		start: (opts: object, Kit: CustomKit, next: CommandNext) => any;
		install: (opts: object, Kit: CustomKit, next: CommandNext) => any;
		extend?: (
			program: DuckCLI.Bridge.Commander,
			Commander: CLIExtenderKit
		) => void;
	};

	web?: {
		external?: Middleware
	};
}

declare module '@produck/duck' {
	interface ProductKit {
		Options: Options;
		Configuration: Configuration;

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

interface Brain {
	readonly configuration: Configuration;
	boot(command?: string): Promise<void>;
	halt(): Promise<void>;
	Model(name: string, options: Feature.Procedure.Data.ValueOptions): this;
	Craft(name: string, options: Feature.Craft.Data.ValueOptions): this;
}

export function Brain(options: Options): Brain;
export const Environment: typeof Feature.Environment;
