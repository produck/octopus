import '@produck/duck';
import * as Broker from './Feature/Broker';

interface Options extends Broker.Options.Member {
	craft: string;
	version: string;
}

interface Configuration {
	id: string;
}

declare module '@produck/duck' {
	interface ProductKit {
		Options: Options;
		Configuration: Configuration;
	}
}
