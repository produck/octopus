import * as Crank from '@produck/crank'

export class Extern extends Crank.Extern {
	readonly args1: Array<any>;
}

interface DumpSchema {

}

export const Evaluator: ReturnType<typeof Crank.defineEngine<{
	val: () => any
}>>
