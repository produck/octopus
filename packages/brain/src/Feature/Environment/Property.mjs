import { Normalizer, P, S } from '@produck/mold';

const sec = n => n * 1000;

export const PropertySchemas = {
	'ENVIRONMENT.REFRESH.INTERVAL': P.UINT32(sec(1)),
	'ENVIRONMENT.AT': P.Integer(0),

	'BRAIN.ALIVE.TIMEOUT': P.UINT32(sec(30)),
	'BRAIN.WATCH.INTERVAL': P.UINT32(sec(1)),

	'APPLICATION.REQUEST.TIMEOUT': P.UINT32(sec(60)),

	'PRODUCT.QUEUE.MAX': P.UINT32(1),
	'PRODUCT.ORDER.TIMEOUT': P.UINT32(sec(30)),

	'AGENT.INTERVAL': P.UINT32(sec(1)),
	'AGENT.TIMEOUT': P.UINT32(sec(5)),
	'AGENT.RETRY': P.UINT8(3),

	'TENTACLE.ALIVE.TIMEOUT': P.UINT32(sec(30)),
	'JOB.TIMEOUT': P.UINT32(sec(24 * 60 * 60)),

	'RJSP.SERVER.HOST': P.String('127.0.0.1'),
	'RJSP.SERVER.PORT': P.UINT32(9173),
	'RJSP.REDIRECT.ENABLED': P.Boolean(false),
};

export const Schema = S.Object(PropertySchemas);
export const normalize = Normalizer(Schema);

const PropertyValue = {};

for (const name in PropertySchemas) {
	PropertyValue[name] = Normalizer(PropertySchemas[name]);
}

export const normalizeValue = (name, value) => PropertyValue[name](value);
export { PropertySchemas as Schemas };
