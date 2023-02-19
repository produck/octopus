import { Entity } from '@produck/shop';
import { Schema } from '@produck/mold';

interface Script {
	main: GeneratorFunction;
	[key: string]: GeneratorFunction;
}

export interface ContextDump {
	values: any[];
	children: ContextDump[];
}

interface Context {
	dump: ContextDump,
	finished: {
		[key: string]: {
			id: string;
			ok: boolean;
			error: string | null;
			target: any;
		}
	},
	crafts: {
		[key: string]: (any: any) => boolean;
	}
}

declare class Program {}

export module Data {
	interface ValueOptions {
		script: Script;
		order: (any: any) => boolean;
		artifact: (any: any) => boolean;
	}

	interface Value extends ValueOptions {
		name: string;
	}

	export const OptionsSchema: Schema<ValueOptions>;
	export function normalizeOptions(options: ValueOptions): ValueOptions;

	export const Schema: Schema<Value>;
	export function normalize(data: Value): Value;
}

export module Options {
	interface Value {
		name: string;
		has?: (name: string) => Promise<boolean>;
		get?: (name: string) => Promise<Data.Value>;
		create?: (name: string, options: Data.ValueOptions) => Promise<Data.Value>;
	}

	export const Schema: Schema<Value>;
	export function normalize(options: Value): Value;
}

interface Result {
	done: boolean;
	ok: boolean;
	error?: string | null;
	artifact?: any;
	creating: Array<{ id: string, source: any, craft: string }>
}

export interface Procedure extends Entity.Proxy.Model {
	readonly name: string;
	readonly program: Program;
	isOrder(order: any): boolean;
	isArtifact(artifact: any): boolean;
	evaluate(order: any, context: Context): Result;
}

export interface ProcedureConstructor extends Entity.Proxy.ModelConstructor {
	new(data: Data.Value): Procedure;

	register(name: string, options: Data.ValueOptions): Promise<Procedure>;
	isValid(name: string): boolean;
	assertValid(name: string): void;
	isProcedureOrder(name: string, order: any): boolean;
	isProcedureArtifact(name: string, artifact: any): boolean;
	evaluate(name: string, order: any, context: Context): Result;
}

export function defineProcedure(options: Options.Value): ProcedureConstructor;
export { defineProcedure as define };
