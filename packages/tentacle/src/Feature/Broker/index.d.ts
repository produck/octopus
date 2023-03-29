import { Schema } from "@produck/mold";

export interface Work<S> {
	readonly isDestroyed: boolean;
	readonly shared: S;
	throw(message: string | null): void;
	complete(target: any): void;
}

type SharedFactory<T = any> = () => T;
type BrokerRun<S> = (work: Work<S>, source: any) => Promise<any> | any;
type BrokerAbort<S> = (work: Work<S>) => Promise<any> | any;

export interface BrokerOptions<T extends SharedFactory = () => any> {
	shared: T;
	run: BrokerRun<ReturnType<T>>;
	abort: BrokerAbort<ReturnType<T>> | null;
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
