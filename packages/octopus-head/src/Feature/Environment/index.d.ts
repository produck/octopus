interface PropertyMap {
	'GROUP.ACTIVITY.TIMEOUT': number;
	'GROUP.WATCHING.INTERVAL': number;
	'GROUP.KICKOUT.TIMEOUT': number;
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

export type KeyName = keyof PropertyMap;

export class Registry {
	get<T extends KeyName>(name: T): PropertyMap[T];
	set<T extends KeyName>(name: T, value: PropertyMap[T]): Promise<void>;
	install(map: PropertyMap): Promise<void>;
}
