
import { Normalizer, P, S } from '@produck/mold';
import { defineRouter } from '@produck/duck-web-koa-forker';

const CredentialSchema = S.Object({
	app: P.StringPattern(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/, 'UUID')(),
	time: P.StringPattern(/^[0-9]+$/, 'timestamp')(),
	sign: P.StringPattern(/^[0-9a-f]+$/, 'signature')(),
});

const isCredential = (data) => {
	try {
		CredentialSchema(data, false);

		return true;
	} catch(error) {
		error;
		return false;
	}
};

const normalizeCredential = Normalizer(CredentialSchema);

export const Router = defineRouter(function APIRouter(router, {
	Environment, Application, PublikKey,
}) {
	router.use(async function authenticate(ctx, next) {
		const _credential = ctx.query;

		if (!isCredential(_credential)) {
			return ctx.throw(400, 'Bad ".app", ".time" or ".sign".');
		}

		const {
			app: applicationId,
			time: _requestedAt,
			sign: signature,
		} = normalizeCredential(_credential);

		const requestedAt = Number(_requestedAt);
		const offset = Math.abs(Date.now() - requestedAt);

		if (offset > Environment.get('APPLICATION.REQUEST.TIMEOUT')) {
			return ctx.throw(408, 'Expired time.');
		}

		const application = await Application.get(applicationId);

		if (application === null) {
			return ctx.throw(404, `Application(${application}) is NOT found.`);
		}

		const keys = await PublikKey.query({
			name: 'OfOwner',
			owner: applicationId,
		});

		for (const key of keys) {
			if (key.verify(_requestedAt, signature)) {
				ctx.state.application = application;

				return next();
			}
		}

		return ctx.throw(401, 'Bad signature.');
	}).get('/authentication', ctx => ctx.body = 'ok');
});
