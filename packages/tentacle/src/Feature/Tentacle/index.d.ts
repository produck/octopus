import { Schema } from '@produck/mold';

export namespace Options {
	interface Object {
		pick: (job: string) => Promise<void>;
		free: (job: string) => Promise<void>;
		update: () => Promise<void>;
		interval: () => number;
	}

	export const Schema: Schema<Object>;
	export function normalize(options: Object): Object;
}

export interface Tentacle {
	readonly active: boolean;
	readonly job: string | null;
	ready: boolean;
	update(): Promise<void>;
	setJob(job: string): Promise<void>;
	start(): this;
	stop(): this;
}

export interface TentacleConstructor {
	new(meta: Member.Meta, server: Member.Server, options): Tentacle;
}

export const Tentacle: TentacleConstructor;
