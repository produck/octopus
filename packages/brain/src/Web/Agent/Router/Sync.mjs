import { Normalizer, P, S } from '@produck/mold';
import { defineRouter } from '@produck/duck-web-koa-forker';

const ConfigurationSchema = S.Object({
	at: P.Integer(),
	interval: P.UINT32(),
	timeout: P.UINT32(),
	host: P.String(),
	port: P.Port(),
	redirect: P.Boolean(),
});

const Schema = S.Object({
	id: P.String(),
	craft: P.String(),
	version: P.String(),
	ready: P.Boolean(),
	job: P.OrNull(P.String(), true),
	config: ConfigurationSchema,
});

const isSyncData = (data) => {
	try {
		Schema(data, false);

		return true;
	} catch {
		return false;
	}
};

export const Router = defineRouter(function SyncRouter(router, {
	Environment, Tentacle, Craft, Job,
}) {
	function Configuration() {
		return {
			at: Environment.get('ENVIRONMENT.AT'),
			interval: Environment.get('AGENT.SYNC.INTERVAL'),
			timeout: Environment.get('AGENT.SYNC.TIMEOUT'),
			host: Environment.get('RJSP.SERVER.HOST'),
			port: Environment.get('RJSP.SERVER.PORT'),
			redirect: Environment.get('RJSP.REDIRECT.ENABLED'),
		};
	}

	router
		.put(async function handleData(ctx) {
			const { body: data } = ctx.request;

			if (!isSyncData(data)) {
				return ctx.throw(400, 'Bad sync data.');
			}

			if (!Craft.isValid(data.craft)) {
				return ctx.throw(403, 'Unavailable craft.');
			}

			const tentacle = await Tentacle.fetch({
				id: data.id,
				craft: data.craft,
				version: data.version,
			});

			await tentacle.save();

			const { job: jobId } = tentacle;

			if (jobId !== null) {
				Job.get(jobId).then(job => job.save());
			}

			ctx.body = { ...data, job: jobId, config: Configuration() };
		});
});
