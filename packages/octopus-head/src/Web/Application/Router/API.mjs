
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

}) {
	router
		.use(async function authenticate(ctx, next) {
			const query = normalizeQuery(ctx.query);
			const requestedAt = Number(query.time);

			const offset = Math.abs(Date.now() - requestedAt);

			if (offset > 60000) {
				return ctx.throw(408, 'Expired time.');
			}

			return next();
		});
});
