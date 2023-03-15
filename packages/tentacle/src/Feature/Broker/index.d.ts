import { Schema } from "@produck/mold";

export interface Work {
	readonly isDestroyed: boolean;
	throw(message: string | null): void;
	complete(target: any): void;
}

type SharedFactory<T> = () => T;
type BrokerRun = (work: Work, source: any) => Promise<any> | any;
type BrokerAbort = (work: Work) => Promise<any> | any;

export interface BrokerOptions<T = any> {
	shared: SharedFactory<T>;
	run: BrokerRun;
	abort: BrokerAbort | null;
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
	export type Member<T = any> = Omit<BrokerOptions<T>, 'name'>;
	export const MemberSchemaas: Member;
	export const Schema: Schema<BrokerOptions>;
	export function normalize(options: BrokerOptions): BrokerOptions;
}
