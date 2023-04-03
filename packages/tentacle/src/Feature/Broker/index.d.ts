import { Schema } from "@produck/mold";

export interface Work<S> {
	readonly isDestroyed: boolean;
	readonly shared: S;
	throw(message: string | null): void;
	complete(target: any): void;
}

type SharedFactory<T = any> = () => T;
type BrokerRun<Shared, Source> = (work: Work<Shared>, source: Source) => Promise<any> | any;
type BrokerAbort<Shared> = (work: Work<Shared>) => Promise<any> | any;

export interface BrokerOptions<Shared extends SharedFactory = () => any, Source extends object = {}> {
	shared: Shared;
	run: BrokerRun<ReturnType<Shared>, Source>;
	abort: BrokerAbort<ReturnType<Shared>> | null;
}

export interface Result<T = any> {
	ok: boolean;
	message?: string | null;
	target?: T;
}

export interface Broker {
	readonly name: string;
	readonly busy: boolean;
	readonly ready: boolean;
	run(): Promise<Result>;
	abort(): Promise<void>;
}

export interface BrokerConstructor {
	new(options: BrokerOptions)
}

export const Broker: BrokerConstructor;

export namespace Options {
	export type Member = BrokerOptions;
	export const MemberSchemas: BrokerOptions;
	export const Schema: Schema<BrokerOptions>;
	export function normalize(options: BrokerOptions): BrokerOptions;
}
