import { Schema } from '@produck/mold';

export namespace Data {
	interface Config {
		at: number;
		interval: number;
		timeout: number;
		retry: number;
		host: string;
		port: number;
		redirect: boolean;
	}

	interface Object {
		id: string;
		craft: string;
		version: string;
		ready: boolean;
		job: string | null;
		config: Config;
	}

	export const HostSchema: Schema<string>;
	export const PortSchema: Schema<number | 9173>;
	export function normalizeData(data: Object): Object;
	export function normalizeConfig(config: Config): Config;
}

export namespace Options {
	interface Object {
		host: () => string;
		port: () => number;
		job: () => string;
		timeout: () => number;
	}

	export const Schema: Schema<Object>;
	export function normalize(options: Object): Object;
}

export interface Result {
	code: number;
	body: null | Data.Object;
}

export namespace Code {
	interface ValueMap {
		0x00: 'OK';
		0x01: 'Sync OK.';
		0x02: 'Getting source OK.';
		0x03: 'Setting target OK.';
		0x04: 'Setting error OK.';

		0x10: 'All ignorable error.';
		0x11: 'Job is not found.';
		0x12: 'Bad source.';
		0x13: 'Bad target.';
		0x14: 'Job is done.';

		0x20: 'All retrieable error.';
		0x21: 'Network error.';
		0x22: 'Bad RJSP data.';

		0x40: 'All critical error.';
		0x41: 'Unacceptable craft.';
	}

	type Value = number | keyof ValueMap;

	export function isRetrieable(code: Value): boolean;
	export function isIgnorable(code: Value): boolean;
	export function isCritical(code: Value): boolean;
	export function isOK(code: Value): boolean;
}

type Target = object;

export interface RJSPClient {
	sync(data: Data.Object): Promise<Result>;
	getSource(): Promise<Result>;
	setTarget(data: Target): Promise<Result>;
	setError(message: string | null): Promise<Result>;
}

export interface RJSPClientConstructor {
	new(options: Options.Object): RJSPClient;
}

export const Client: RJSPClientConstructor;
