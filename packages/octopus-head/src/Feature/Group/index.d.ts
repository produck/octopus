

export class Group {
	on(eventType: 'round', listener: (...args: any[]) => any): void;
	start(): void;
}
