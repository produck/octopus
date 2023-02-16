import { Entity } from '@produck/shop';
import { Schema } from '@produck/mold';

declare class RecordSet<T> {
	has(id: string): boolean;
	readonly list: Array<T>;
}

interface JobValue {
	id: string;
	createdAt: number;
}

interface TentacleValue {
	id: string;
}

declare class Evaluator {
	Job: RecordSet<JobValue>;
	Tentacle: RecordSet<TentacleValue>;
	assign(jobId: string, tentacleId: string): void;
}

type Policy = (evaluator: Evaluator) => void;

export module Data {
	interface OptionsValue<S = any, T = any> {
		policy?: Policy;
		source?: (any: S) => boolean;
		target?: (any: T) => boolean;
	}

	interface Value<S = any, T = any> extends OptionsValue<S, T> {
		name: string;
	}

	export const FIFO: Policy;

	export const OptionsSchema: Schema<OptionsValue>;
	export function normalizeOptions(options: OptionsValue): OptionsValue;

	export const Schema: Schema<Value>;
	export function normalize(data: Value): Value;
}

export module Options {
	interface Value {
		name?: string;
		has?: (name: string) => Promise<boolean>;
		get?: (name: string) => Promise<Data.Value>;
		create?: (name: string, options: Data.OptionsValue) => Promise<Data.Value>;
	}

	export const Schema: Schema<Value>;
	export function normalize(options: Value): Value;
}

type MatchSet = { [key: string]: string };

export interface Craft extends Entity.Proxy.Model {
	readonly name: string;
	isSource(any: any): boolean;
	isTarget(any: any): boolean;
	evaluate(jobList: JobValue[], tentacleList: TentacleValue[]): MatchSet;
}

type EventMap = {
	'policy-error': (error: Error) => void;
}

export type EventName = keyof EventMap;

export interface CraftConstructor extends Entity.Proxy.ModelConstructor {
	new(data: Data.Value): Craft;

	on<T extends EventName>(eventName: T, listener: EventMap[T]): this;
	off<T extends EventName>(eventName: T, listener: EventMap[T]): this;
	once<T extends EventName>(eventName: T, listener: EventMap[T]): this;

	register(name: string, options: Data.OptionsValue): Promise<Craft>;
	isValid(name: string): boolean;
	assertValid(name: string): void;
	isCraftSource(name: string, source: any): boolean;
	isCraftTarget(name: string, target: any): boolean;
}

export function defineCraft(options: Options.Value): CraftConstructor;
export { defineCraft as define };
