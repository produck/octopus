import * as Duck from '@produck/duck';

declare namespace Workshop {
	interface Model {
		name: string;
		procedure: () => {};
		//about order
		//about artifact
	}

	interface Product {
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
	}

	interface Queue {
		getLength(): Promise<number>;
		create(order: any): Promise<Product>;
		get(productId: string): Promise<Product> | Promise<null>;
		filter(applicationId: string): Promise<Product[]>;
	}

	interface Object {
		queue: Queue;
		hasModel(name: string): boolean;
	}
}

declare namespace Application {
	class Object {
		readonly id: string;
		verify(timestamp: string, signatureHex: string): Promise<boolean>;
	}

	interface Registry {
		get(id: string): Promise<Object> | Promise<null>;
	}
}

declare namespace Environment {
	interface Map {
		'ENVIRONMENT.REFRESH.INTERVAL': number;
		'APPLICATION.TIMEOUT': number;
		'SCHEDULER.EVALUATING.INTERVAL': number;
		'PRODUCT.QUEUE.MAX': number;
		'PRODUCT.ORDER.CREATION.TIMEOUT': number;
		'AGENT.SYNC.INTERVAL': number;
		'AGENT.SYNC.TIMEOUT': number;
		'AGENT.SYNC.RETRY.INTERVAL': number;
		'RJSP.SERVER.HOST': string;
		'RJSP.SERVER.PORT': number;
	}

	type KeyName = keyof Map;

	interface Registry {
		get<T extends KeyName>(name: T): Map[T];
	}
}

declare module '@produck/duck' {
	interface ProductKit {
		Application: Application.Registry;
		Environment: Environment.Registry;
		Workshop: Workshop.Object;
	}
}
