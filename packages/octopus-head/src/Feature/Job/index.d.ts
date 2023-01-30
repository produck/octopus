export interface Craft {
	isOrder(): boolean;
	isArtifact(): boolean;
}

export interface CraftRegistry {
	has(name: string): boolean;
	get(name: string): Model;
	register(descriptor: any): Model;
}

export interface Job {
	readonly isFinished: boolean;
	getOrder(): Promise<any>;
	setOrder(): Promise<any>;
	getArtifact(): Promise<any>;
	setArtifact(): Promise<any>;
}

export interface Pool {
	get(id: string): Promise<Job>;
}
