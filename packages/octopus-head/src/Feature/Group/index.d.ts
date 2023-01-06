import { EventEmitter } from 'node:events';

export class Group extends EventEmitter {
	readonly id: string;
	on(eventName: 'round', listener: (...args: any[]) => void): this;
	start(): void;
	load(): Promise<void>;
}
