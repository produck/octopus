
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
	order: any;
	artifact: any;
	orderedAt: Date;
	createdAt: Date;
	startedAt: Date;
	finisthedAt: Date;
	deletedAt: Date;
	statusCode: number;
	message: string | null;

	readonly isFinished: boolean;
	readonly isDeleted: boolean;
	abort(): Promise<void>;
	delete(): Promise<void>;
	save(): Promise<void>;
	start(): Promise<void>;
	evaluate(): Promise<void>;
	Job: ProductJob;
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
