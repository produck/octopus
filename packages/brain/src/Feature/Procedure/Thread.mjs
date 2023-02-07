import { Normalizer, P } from '@produck/mold';

const WorkflowSchema = P.Instance((function* (){}).constructor);
const normalizeWorkflow = Normalizer(WorkflowSchema);

export class ProcedureThread {
	#finish = Symbol();

	job(craftName, request) {

	}

	throw(message) {

	}

	resolve(workflow) {
		while (1) {

		}
	}

	all(workflowList) {

	}
}
