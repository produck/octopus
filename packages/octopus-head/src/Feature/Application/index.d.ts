
export class Application {
	readonly id: string;
	verify(timestamp: string, signatureHex: string): Promise<boolean>;
}

export interface Registry {
	get(id: string): Promise<Application> | Promise<null>;
}
