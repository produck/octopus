
export interface Model {
	name: string;
	procedure: () => {};
	//about order
	//about artifact
}


export interface ModelRegistry {
	has(name: string): boolean;
	get(name: string): Model;
	register(descriptor: any): Model;
}

export interface Product {
	id: string;
	model: Model;
	orderedAt: Date;
	createdAt: Date;
	startedAt: Date;
	finisthedAt: Date;
	status: number;
	message: string | null;

	order(): Promise<void>;
	start(): Promise<void>;
	finish(status: number, message: string | null): Promise<void>;
}

export interface Queue {
	getWaitingLength(): Promise<number>;
	create(order: any): Promise<Product>;
	get(productId: string): Promise<Product> | Promise<null>;
	filter(applicationId: string): Promise<Product[]>;
}

export interface ProductJob {
	all(): Promise<Job[]>;
}
