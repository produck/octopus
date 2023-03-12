import { Schema } from "@produck/mold";

export interface Work {
	readonly isDestroyed: boolean;
	throw(message: string | null): void;
	complete(target: any): void;
}

type SharedFactory<T> = () => T;
type BrokerHandler = (work: Work) => Promise<any> | any;

export interface BrokerOptions<T = any> {
	name: string;
	shared: SharedFactory<T>;
	run: BrokerHandler;
	abort: BrokerHandler | null;
}

export interface Result<T = any> {
	ok: boolean;
	message?: string | null;
	target?: T;
}

export interface Broker {
	readonly name: string;
	readonly busy: boolean;
	run(): Promise<Result>;
	abort(): Promise<void>;
}

export interface BrokerConstructor {
	new(options: BrokerOptions)
}

export const Broker: BrokerConstructor;

export namespace Options {
	export type Member = Omit<BrokerOptions, 'name'>;
	export const MemberSchemaas: Member;
	export const Schema: Schema<BrokerOptions>;
	export function normalize(options: BrokerOptions): BrokerOptions;
}
