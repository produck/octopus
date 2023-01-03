
import { Normalizer, P, PROPERTY, S } from '@produck/mold';
import { defineRouter } from '@produck/duck-web-koa-forker';

const QuerySchema = S.Object({
	app: P.StringPattern(/^[0-9a-f]$/i, 'application id')(),
	time: P.StringPattern(/^[0-9]$/i, 'timestamp')(),
	sign: P.StringPattern(/^[0-9a-f]+$/i, 'signature')(),
	[PROPERTY]: P.String(),
});

const normalizeQuery = Normalizer(QuerySchema);

export const Router = defineRouter(function APIRouter(router, {
	Application, Environment,
}) {
	router
		.use(async function authenticate(ctx, next) {
			const query = ctx.query;

			try {
				normalizeQuery(query);
			} catch {
				return ctx.throw(400, 'Bad app, time or sign.');
			}

			const requestedAt = Number(query.time);
			const offset = Math.abs(Date.now() - requestedAt);

			if (offset > Environment.get('APPLICATION.TIMEOUT')) {
				return ctx.throw(408, 'Expired time.');
			}

			const applicationId = query.app.toLowerCase();
			const application = await Application.get(applicationId);

			if (application === null) {
				return ctx.throw(404, `Application(${application}) is NOT found.`);
			}

			if (!await application.verify(query.time, query.sign)) {
				return ctx.throw(401, 'Bad signature.');
			}

			ctx.state.application = application;

			return next();
		});
});
