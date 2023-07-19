import * as Crank from '@produck/crank';
import { Schema } from '@produck/mold';

interface DumpOptions {
	value: any[];
	children: DumpOptions[];
}

interface Job {
	id: string,
	ok: boolean,
	error: any,
	target?: any
}

export class Extern extends Crank.Extern {
	readonly dump?: DumpOptions;
	readonly creating: Array<{ id: string, craft: string, source: any }>

	hasJob: (id: string) => boolean;
	fetchJob: (id: string) => Job;
	planJob: (id: string, craft: string, source: any) => void;
	saveData: (key: any, value: any) => void;
	fetchData: (key: any) => any;
	hasData: (key: any) => boolean;
	assertCraftAndSource: (name: string, source: any) => void;
}

export const Evaluator: ReturnType<typeof Crank.defineEngine<{
	[key in 'val' | 'run' | 'all']: () => any;
}>>

export const DumpSchema: Schema<DumpOptions>;
